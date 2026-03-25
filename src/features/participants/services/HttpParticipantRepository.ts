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
  userId: string;
  userName?: string;
}

// Includes both camelCase (new) and snake_case (legacy) field names for backward compat
interface ParticipantApiResponse {
  identifier: string;
  userId?: string;
  user_email?: string;
  userName?: string;
  user_name?: string;
  eventId?: string;
  event_id?: string;
  status: string;
  joinedAt?: number;
  joined_at?: number;
  createdAt?: number;
  created_at?: number;
  updatedAt?: number;
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
      userId: data.userId,
      userName: data.userName,
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
    userId: string,
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
      `${this.baseUrl}/events/${eventId}/participants/${userId}`,
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

  async removeParticipant(eventId: string, userId: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/participants/${userId}`,
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
    const joinedAt = response.joinedAt ?? response.joined_at;
    const createdAt = response.createdAt ?? response.created_at ?? joinedAt;
    const updatedAt = response.updatedAt ?? response.updated_at;
    return {
      id: response.identifier,
      userId: response.userId ?? response.user_email ?? '',
      userName: response.userName ?? response.user_name ?? undefined,
      eventId: response.eventId ?? response.event_id ?? '',
      status: response.status as ParticipantStatus,
      joinedAt: new Date(joinedAt!),
      createdAt: new Date(createdAt!),
      updatedAt: updatedAt ? new Date(updatedAt) : undefined,
    };
  }
}
