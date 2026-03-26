import type { InviteLinkRepository, InviteLink } from '../types/InviteLink';

export class GetActiveInviteLink {
  constructor(private repository: InviteLinkRepository) {}

  async execute(eventId: string): Promise<InviteLink | null> {
    return this.repository.getActiveInviteLink(eventId);
  }
}
