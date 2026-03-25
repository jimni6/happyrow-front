import type {
  Participant,
  ParticipantCreationRequest,
  ParticipantUpdateRequest,
  ParticipantStatus,
} from '../types/Participant';
import type { ParticipantRepository } from '../types/ParticipantRepository';
import { throwApiError } from '@/core/errors/ApiError';
import { apiConfig } from '@/core/config/api';

interface ParticipantApiRequest {
  user_email: string;
  status: string;
}

interface ParticipantApiResponse {
  user_email: string;
  user_name?: string;
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
    baseUrl: string = apiConfig.baseUrl
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
      await throwApiError(response);
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
      await throwApiError(response);
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
      await throwApiError(response);
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
      await throwApiError(response);
    }
  }

  private mapApiResponseToParticipant(
    response: ParticipantApiResponse
  ): Participant {
    return {
      userEmail: response.user_email,
      userName: response.user_name ?? undefined,
      eventId: response.event_id,
      status: response.status as ParticipantStatus,
      joinedAt: new Date(response.joined_at),
      updatedAt: response.updated_at
        ? new Date(response.updated_at)
        : undefined,
    };
  }
}
