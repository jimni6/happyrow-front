import type {
  InviteLinkRepository,
  InviteLink,
  InviteLinkCreationRequest,
} from '../types/InviteLink';

export class CreateInviteLink {
  constructor(private repository: InviteLinkRepository) {}

  async execute(
    eventId: string,
    options?: InviteLinkCreationRequest
  ): Promise<InviteLink> {
    return this.repository.createInviteLink(eventId, options);
  }
}
