import type {
  InviteLink,
  InviteLinkCreationRequest,
  InviteLinkRepository,
} from '../types/InviteLink';
import { throwApiError } from '@/core/errors/ApiError';
import { apiConfig } from '@/core/config/api';

// Backend response format (snake_case, timestamps in ms)
interface InviteLinkApiResponse {
  token: string;
  event_id: string;
  invite_url: string;
  created_at: number;
  expires_at: number;
  max_uses: number | null;
  current_uses: number;
  status: 'ACTIVE';
  created_by: string;
}

export class HttpInviteLinkService implements InviteLinkRepository {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(
    getToken: () => string | null,
    baseUrl: string = apiConfig.baseUrl
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  async createInviteLink(
    eventId: string,
    options?: InviteLinkCreationRequest
  ): Promise<InviteLink> {
    const token = this.getToken();
    if (!token) throw new Error('Authentication required');

    const body: Record<string, unknown> = {};
    if (options?.expiresInDays !== undefined)
      body.expires_in_days = options.expiresInDays;
    if (options?.maxUses !== undefined) body.max_uses = options.maxUses;

    const response = await fetch(`${this.baseUrl}/events/${eventId}/invites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 409) {
      // Active link already exists, fetch it instead
      const existing = await this.getActiveInviteLink(eventId);
      if (existing) return existing;
    }

    if (!response.ok) await throwApiError(response);
    return this.mapResponse(await response.json());
  }

  async getActiveInviteLink(eventId: string): Promise<InviteLink | null> {
    const token = this.getToken();
    if (!token) throw new Error('Authentication required');

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/invites/active`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 204) return null;
    if (response.status === 403) return null;
    if (!response.ok) await throwApiError(response);

    return this.mapResponse(await response.json());
  }

  async revokeInviteLink(eventId: string, token: string): Promise<void> {
    const authToken = this.getToken();
    if (!authToken) throw new Error('Authentication required');

    const response = await fetch(
      `${this.baseUrl}/events/${eventId}/invites/${token}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (!response.ok && response.status !== 409) {
      await throwApiError(response);
    }
  }

  private mapResponse(data: InviteLinkApiResponse): InviteLink {
    return {
      token: data.token,
      eventId: data.event_id,
      inviteUrl: `${window.location.origin}/invite/${data.token}`,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      maxUses: data.max_uses,
      currentUses: data.current_uses,
      status: data.status,
      createdBy: data.created_by,
    };
  }
}
