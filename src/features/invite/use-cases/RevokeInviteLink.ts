import type { InviteLinkRepository } from '../types/InviteLink';

export class RevokeInviteLink {
  constructor(private repository: InviteLinkRepository) {}

  async execute(eventId: string, token: string): Promise<void> {
    return this.repository.revokeInviteLink(eventId, token);
  }
}
