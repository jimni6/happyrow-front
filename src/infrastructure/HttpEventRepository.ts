import type { Event, EventCreationRequest } from '../domain/Event';
import type { EventRepository } from '../domain/EventRepository';

// API response interface for events
interface EventApiResponse {
  id: number;
  name: string;
  date: string; // ISO string from API
  location: string;
  type: string;
  organizerId: string;
}

export class HttpEventRepository implements EventRepository {
  private baseUrl: string;

  constructor(
    baseUrl: string = process.env.VITE_API_BASE_URL ||
      'http://localhost:8080/api'
  ) {
    this.baseUrl = baseUrl;
  }

  async createEvent(eventData: EventCreationRequest): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const eventResponse: EventApiResponse = await response.json();

    // Convert date string back to Date object
    return {
      ...eventResponse,
      date: new Date(eventResponse.date),
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
      ...eventResponse,
      date: new Date(eventResponse.date),
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
      ...event,
      date: new Date(event.date),
    }));
  }

  async updateEvent(
    id: number,
    eventData: Partial<EventCreationRequest>
  ): Promise<Event> {
    const response = await fetch(`${this.baseUrl}/events/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const eventResponse: EventApiResponse = await response.json();
    return {
      ...eventResponse,
      date: new Date(eventResponse.date),
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
