export type InviteValidationStatus =
  | 'VALID'
  | 'EXPIRED'
  | 'REVOKED'
  | 'EXHAUSTED';

export interface InviteEventSummary {
  identifier: string;
  name: string;
  eventDate: Date;
  location: string;
  type: string;
  organizerName: string;
  participantCount: number;
}

export interface InviteValidation {
  token: string;
  status: InviteValidationStatus;
  event: InviteEventSummary | null;
  expiresAt: Date | null;
}

export interface AcceptInviteResult {
  eventId: string;
  userId: string;
  userName: string | null;
  status: 'CONFIRMED';
  joinedAt: Date;
}

export interface InviteRepository {
  validateInvite(token: string): Promise<InviteValidation | null>;
  acceptInvite(token: string): Promise<AcceptInviteResult>;
}
