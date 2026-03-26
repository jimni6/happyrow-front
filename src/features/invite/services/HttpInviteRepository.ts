import type {
  InviteValidation,
  AcceptInviteResult,
  InviteRepository,
} from '../types/Invite';
import { throwApiError } from '@/core/errors/ApiError';
import { apiConfig } from '@/core/config/api';

interface InviteValidationApiResponse {
  token: string;
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'EXHAUSTED';
  event: {
    identifier: string;
    name: string;
    event_date: number;
    location: string;
    type: string;
    organizer_name: string;
    participant_count: number;
  } | null;
  expires_at: number | null;
}

interface AcceptInviteApiResponse {
  event_id: string;
  user_id: string;
  user_name: string | null;
  status: 'CONFIRMED';
  joined_at: number;
}

export class HttpInviteRepository implements InviteRepository {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(
    getToken: () => string | null,
    baseUrl: string = apiConfig.baseUrl
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  async validateInvite(token: string): Promise<InviteValidation | null> {
    const response = await fetch(`${this.baseUrl}/invites/${token}`);

    if (response.status === 404) return null;
    if (!response.ok) await throwApiError(response);

    const data: InviteValidationApiResponse = await response.json();
    return {
      token: data.token,
      status: data.status,
      event: data.event
        ? {
            identifier: data.event.identifier,
            name: data.event.name,
            eventDate: new Date(data.event.event_date),
            location: data.event.location,
            type: data.event.type,
            organizerName: data.event.organizer_name,
            participantCount: data.event.participant_count,
          }
        : null,
      expiresAt: data.expires_at ? new Date(data.expires_at) : null,
    };
  }

  async acceptInvite(token: string): Promise<AcceptInviteResult> {
    const authToken = this.getToken();
    if (!authToken) throw new Error('Authentication required');

    const response = await fetch(`${this.baseUrl}/invites/${token}/accept`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (response.status === 409) {
      const body = await response.json();
      throw new AlreadyParticipantError(body.event_id);
    }

    if (!response.ok) await throwApiError(response);

    const data: AcceptInviteApiResponse = await response.json();
    return {
      eventId: data.event_id,
      userId: data.user_id,
      userName: data.user_name,
      status: data.status,
      joinedAt: new Date(data.joined_at),
    };
  }
}

export class AlreadyParticipantError extends Error {
  constructor(public readonly eventId: string) {
    super('Already a participant of this event');
    this.name = 'AlreadyParticipantError';
  }
}
