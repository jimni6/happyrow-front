import type { Event, EventCreationRequest } from '../domain/Event';
import type { EventRepository } from '../domain/EventRepository';

// API request body format that matches backend
interface EventApiRequest {
  name: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
}

// API response interface for events
interface EventApiResponse {
  id: number;
  name: string;
  description: string;
  event_date: string;
  location: string;
  type: string;
  organizerId?: string;
}

export class HttpEventRepository implements EventRepository {
  private baseUrl: string;

  constructor(
    baseUrl: string = import.meta.env.VITE_API_BASE_URL ||
      'https://happyrow-core.onrender.com/event/configuration/api/v1'
  ) {
    this.baseUrl = baseUrl;
  }

  async createEvent(eventData: EventCreationRequest): Promise<Event> {
    // Map frontend format to backend format
    const apiRequest: EventApiRequest = {
      name: eventData.name,
      description: eventData.description,
      event_date: eventData.date,
      location: eventData.location,
      type: eventData.type,
    };

    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': eventData.organizerId,
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
      id: eventResponse.id,
      name: eventResponse.name,
      description: eventResponse.description,
      date: new Date(eventResponse.event_date),
      location: eventResponse.location,
      type: eventResponse.type,
      organizerId: eventData.organizerId,
    };
  }

  async getEventById(id: number): Promise<Event | null> {
    const response = await fetch(`${this.baseUrl}/events/${id}`);

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const eventResponse: EventApiResponse = await response.json();
    return {
      id: eventResponse.id,
      name: eventResponse.name,
      description: eventResponse.description,
      date: new Date(eventResponse.event_date),
      location: eventResponse.location,
      type: eventResponse.type,
      organizerId: eventResponse.organizerId || '',
    };
  }

  async getEventsByOrganizer(organizerId: string): Promise<Event[]> {
    const response = await fetch(
      `${this.baseUrl}/events?organizerId=${organizerId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const eventsResponse: EventApiResponse[] = await response.json();
    return eventsResponse.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: new Date(event.event_date),
      location: event.location,
      type: event.type,
      organizerId: event.organizerId || '',
    }));
  }

  async updateEvent(
    id: number,
    eventData: Partial<EventCreationRequest>
  ): Promise<Event> {
    // Map frontend format to backend format
    const apiRequest: Partial<EventApiRequest> = {};
    if (eventData.name) apiRequest.name = eventData.name;
    if (eventData.description) apiRequest.description = eventData.description;
    if (eventData.date) apiRequest.event_date = eventData.date;
    if (eventData.location) apiRequest.location = eventData.location;
    if (eventData.type) apiRequest.type = eventData.type;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (eventData.organizerId) {
      headers['x-user-id'] = eventData.organizerId;
    }

    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'PUT',
      headers,
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
      id: eventResponse.id,
      name: eventResponse.name,
      description: eventResponse.description,
      date: new Date(eventResponse.event_date),
      location: eventResponse.location,
      type: eventResponse.type,
      organizerId: eventResponse.organizerId || eventData.organizerId || '',
    };
  }

  async deleteEvent(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }
}
