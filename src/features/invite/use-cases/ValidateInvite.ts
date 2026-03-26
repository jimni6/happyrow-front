import type { InviteRepository, InviteValidation } from '../types/Invite';

export class ValidateInvite {
  constructor(private repository: InviteRepository) {}

  async execute(token: string): Promise<InviteValidation | null> {
    return this.repository.validateInvite(token);
  }
}
