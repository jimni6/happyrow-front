import type {
  Participant,
  ParticipantCreationRequest,
  ParticipantUpdateRequest,
  ParticipantStatus,
} from '../types/Participant';
import type { ParticipantRepository } from '../types/ParticipantRepository';

interface ParticipantApiRequest {
  user_email: string;
  status: string;
}

interface ParticipantApiResponse {
  user_email: string;
  event_id: string;
  status: string;
  joined_at: number;
  updated_at?: number;
}

export class HttpParticipantRepository implements ParticipantRepository {
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

  async addParticipant(data: ParticipantCreationRequest): Promise<Participant> {
    const apiRequest: ParticipantApiRequest = {
      user_email: data.userEmail,
      status: data.status,
    };

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${data.eventId}/participants`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiRequest),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const participantResponse: ParticipantApiResponse = await response.json();
    return this.mapApiResponseToParticipant(participantResponse);
  }

  async getParticipantsByEvent(eventId: string): Promise<Participant[]> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/participants`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const participantsResponse: ParticipantApiResponse[] =
      await response.json();
    return participantsResponse.map(p => this.mapApiResponseToParticipant(p));
  }

  async updateParticipantStatus(
    eventId: string,
    userEmail: string,
    data: ParticipantUpdateRequest
  ): Promise<Participant> {
    const apiRequest = {
      status: data.status,
    };

    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/participants/${userEmail}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiRequest),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const participantResponse: ParticipantApiResponse = await response.json();
    return this.mapApiResponseToParticipant(participantResponse);
  }

  async removeParticipant(eventId: string, userEmail: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/participants/${userEmail}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  private mapApiResponseToParticipant(
    response: ParticipantApiResponse
  ): Participant {
    return {
      userEmail: response.user_email,
      eventId: response.event_id,
      status: response.status as ParticipantStatus,
      joinedAt: new Date(response.joined_at),
      updatedAt: response.updated_at
        ? new Date(response.updated_at)
        : undefined,
    };
  }
}
