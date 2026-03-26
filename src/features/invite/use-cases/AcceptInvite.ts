import type { InviteRepository, AcceptInviteResult } from '../types/Invite';

export class AcceptInvite {
  constructor(private repository: InviteRepository) {}

  async execute(token: string): Promise<AcceptInviteResult> {
    return this.repository.acceptInvite(token);
  }
}
