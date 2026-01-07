import type { Event, EventCreationRequest, EventType } from '../types/Event';
import type { EventRepository } from '../types/EventRepository';

// API request body format that matches backend
interface EventApiRequest {
  name: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
}

// API response interface for events (matches backend format)
interface EventApiResponse {
  identifier: string; // Backend uses 'identifier' not 'id'
  name: string;
  description: string;
  event_date: number; // Backend returns timestamp
  location: string;
  type: string;
  creator?: string; // Backend uses 'creator' not 'organizerId'
  creation_date?: number;
  update_date?: number;
  members?: string[];
}

export class HttpEventRepository implements EventRepository {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(
    getToken: () => string | null,
    baseUrl: string = import.meta.env.VITE_API_BASE_URL ||
      'https://happyrow-core.onrender.com/event/configuration/api/v1'
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
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(apiRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const eventResponse: EventApiResponse = await response.json();

    // Convert backend format to frontend format
    return {
      id: eventResponse.identifier,
      name: eventResponse.name,
      description: eventResponse.description,
      date: new Date(eventResponse.event_date),
      location: eventResponse.location,
      type: this.mapStringToEventType(eventResponse.type),
      organizerId: eventResponse.creator || eventData.organizerId,
    };
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const eventResponse: EventApiResponse = await response.json();
    return {
      id: eventResponse.identifier,
      name: eventResponse.name,
      description: eventResponse.description,
      date: new Date(eventResponse.event_date),
      location: eventResponse.location,
      type: this.mapStringToEventType(eventResponse.type),
      organizerId: eventResponse.creator || '',
    };
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const eventsResponse: EventApiResponse[] = await response.json();
    return eventsResponse.map(event => ({
      id: event.identifier,
      name: event.name,
      description: event.description,
      date: new Date(event.event_date),
      location: event.location,
      type: this.mapStringToEventType(event.type),
      // Backend uses 'creator' field for organizerId
      organizerId: event.creator || organizerId,
    }));
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const eventResponse: EventApiResponse = await response.json();
    return {
      id: eventResponse.identifier,
      name: eventResponse.name,
      description: eventResponse.description,
      date: new Date(eventResponse.event_date),
      location: eventResponse.location,
      type: this.mapStringToEventType(eventResponse.type),
      organizerId: eventResponse.creator || eventData.organizerId || '',
    };
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}
