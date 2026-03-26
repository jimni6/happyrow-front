import type { Event, EventCreationRequest, EventType } from '../types/Event';
import type { EventRepository } from '../types/EventRepository';
import { throwApiError } from '@/core/errors/ApiError';
import { apiConfig } from '@/core/config/api';

// API request body format that matches backend (snake_case)
interface EventApiRequest {
  name: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
  members?: string[];
}

// API response interface for events (matches backend format)
// Includes both camelCase (new) and snake_case (legacy) field names for backward compat
interface EventApiResponse {
  identifier: string;
  name: string;
  description: string;
  eventDate?: string | number;
  event_date?: string | number;
  location: string;
  type: string;
  creator?: string;
  creationDate?: string | number;
  creation_date?: string | number;
  updateDate?: string | number;
  update_date?: string | number;
  members?: string[];
}

export class HttpEventRepository implements EventRepository {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(
    getToken: () => string | null,
    baseUrl: string = apiConfig.baseUrl
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private mapStringToEventType = (type: string): EventType =>
    type.toUpperCase() as EventType;

  async createEvent(eventData: EventCreationRequest): Promise<Event> {
    // Map frontend format to backend format
    const apiRequest: EventApiRequest = {
      name: eventData.name,
      description: eventData.description,
      event_date: eventData.date,
      location: eventData.location,
      type: eventData.type,
    };

    const token = this.getToken();
    // #region agent log
    fetch('http://127.0.0.1:7650/ingest/addb5d08-2bef-4f9b-b9ff-5c0712d6202d', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '9c0c76',
      },
      body: JSON.stringify({
        sessionId: '9c0c76',
        location: 'HttpEventRepository.ts:createEvent',
        message: 'pre-fetch state',
        data: {
          baseUrl: this.baseUrl,
          hasToken: !!token,
          tokenLength: token?.length,
          fullUrl: `${this.baseUrl}/events`,
        },
        timestamp: Date.now(),
        hypothesisId: 'H1+H2',
      }),
    }).catch(() => {});
    // #endregion

    if (!token) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7650/ingest/addb5d08-2bef-4f9b-b9ff-5c0712d6202d',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '9c0c76',
          },
          body: JSON.stringify({
            sessionId: '9c0c76',
            location: 'HttpEventRepository.ts:createEvent',
            message: 'TOKEN IS NULL - throwing auth error',
            data: {},
            timestamp: Date.now(),
            hypothesisId: 'H2',
          }),
        }
      ).catch(() => {});
      // #endregion
      throw new Error('Authentication required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiRequest),
      });

      // #region agent log
      fetch(
        'http://127.0.0.1:7650/ingest/addb5d08-2bef-4f9b-b9ff-5c0712d6202d',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '9c0c76',
          },
          body: JSON.stringify({
            sessionId: '9c0c76',
            location: 'HttpEventRepository.ts:createEvent',
            message: 'fetch response received',
            data: {
              status: response.status,
              ok: response.ok,
              statusText: response.statusText,
              url: response.url,
            },
            timestamp: Date.now(),
            hypothesisId: 'H3+H4',
          }),
        }
      ).catch(() => {});
      // #endregion

      if (!response.ok) {
        await throwApiError(response);
      }

      const eventResponse: EventApiResponse = await response.json();

      return this.mapApiResponseToEvent(eventResponse, eventData.organizerId);
    } catch (fetchError) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7650/ingest/addb5d08-2bef-4f9b-b9ff-5c0712d6202d',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': '9c0c76',
          },
          body: JSON.stringify({
            sessionId: '9c0c76',
            location: 'HttpEventRepository.ts:createEvent',
            message: 'FETCH FAILED with error',
            data: {
              errorName: (fetchError as Error)?.name,
              errorMessage: (fetchError as Error)?.message,
              errorType: typeof fetchError,
            },
            timestamp: Date.now(),
            hypothesisId: 'H3+H4',
          }),
        }
      ).catch(() => {});
      // #endregion
      throw new Error(
        `Failed to create event: ${(fetchError as Error).message}`
      );
    }
  }

  async getEventById(id: string): Promise<Event | null> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      await throwApiError(response);
    }

    const eventResponse: EventApiResponse = await response.json();
    return this.mapApiResponseToEvent(eventResponse);
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/events`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await throwApiError(response);
    }

    const json = await response.json();
    const eventsResponse: EventApiResponse[] = Array.isArray(json)
      ? json
      : Array.isArray(json.events)
        ? json.events
        : [];
    return eventsResponse.map(event =>
      this.mapApiResponseToEvent(event, organizerId)
    );
  }

  async updateEvent(
    id: string,
    eventData: Partial<EventCreationRequest>
  ): Promise<Event> {
    // Map frontend format to backend format
    const apiRequest: Partial<EventApiRequest> = {};
    if (eventData.name) apiRequest.name = eventData.name;
    if (eventData.description) apiRequest.description = eventData.description;
    if (eventData.date) apiRequest.event_date = eventData.date;
    if (eventData.location) apiRequest.location = eventData.location;
    if (eventData.type) apiRequest.type = eventData.type;

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      await throwApiError(response);
    }

    const eventResponse: EventApiResponse = await response.json();
    return this.mapApiResponseToEvent(eventResponse, eventData.organizerId);
  }

  async deleteEvent(id: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      await throwApiError(response);
    }
  }

  private mapApiResponseToEvent(
    response: EventApiResponse,
    fallbackOrganizerId?: string
  ): Event {
    const dateValue = response.eventDate ?? response.event_date;
    return {
      id: response.identifier,
      name: response.name,
      description: response.description,
      date: new Date(dateValue!),
      location: response.location,
      type: this.mapStringToEventType(response.type),
      organizerId: response.creator || fallbackOrganizerId || '',
    };
  }
}
