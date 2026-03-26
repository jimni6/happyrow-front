export interface InviteLink {
  token: string;
  eventId: string;
  inviteUrl: string;
  createdAt: Date;
  expiresAt: Date;
  maxUses: number | null;
  currentUses: number;
  status: 'ACTIVE';
  createdBy: string;
}

export interface InviteLinkCreationRequest {
  expiresInDays?: number;
  maxUses?: number | null;
}

export interface InviteLinkRepository {
  createInviteLink(
    eventId: string,
    options?: InviteLinkCreationRequest
  ): Promise<InviteLink>;
  getActiveInviteLink(eventId: string): Promise<InviteLink | null>;
  revokeInviteLink(eventId: string, token: string): Promise<void>;
}
