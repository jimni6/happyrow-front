import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Contribution } from '@/features/contributions/types/Contribution';
import type { ContributionRepository } from '@/features/contributions/types/ContributionRepository';
import { AddContribution } from '@/features/contributions/use-cases/AddContribution';
import { DeleteContribution } from '@/features/contributions/use-cases/DeleteContribution';
import { GetContributions } from '@/features/contributions/use-cases/GetContributions';
import { UpdateContribution } from '@/features/contributions/use-cases/UpdateContribution';

function createMockContribution(
  overrides?: Partial<Contribution>
): Contribution {
  return {
    id: 'contrib-1',
    eventId: 'event-1',
    resourceId: 'resource-1',
    userId: 'user-1',
    quantity: 2,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createMockContributionRepository(): ContributionRepository {
  return {
    getContributionsByResource: vi.fn(),
    createContribution: vi.fn(),
    updateContribution: vi.fn(),
    deleteContribution: vi.fn(),
  };
}

describe('AddContribution', () => {
  let repository: ContributionRepository;
  let useCase: AddContribution;

  beforeEach(() => {
    repository = createMockContributionRepository();
    useCase = new AddContribution(repository);
  });

  it('creates a contribution successfully', async () => {
    const created = createMockContribution({ id: 'new-id', quantity: 3 });
    vi.mocked(repository.createContribution).mockResolvedValue(created);

    const input = {
      eventId: 'event-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      quantity: 3,
    };

    const result = await useCase.execute(input);

    expect(repository.createContribution).toHaveBeenCalledTimes(1);
    expect(repository.createContribution).toHaveBeenCalledWith({
      eventId: 'event-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      quantity: 3,
    });
    expect(result).toEqual(created);
  });
});

describe('GetContributions', () => {
  let repository: ContributionRepository;
  let useCase: GetContributions;

  beforeEach(() => {
    repository = createMockContributionRepository();
    useCase = new GetContributions(repository);
  });

  it('fetches contributions for an event resource', async () => {
    const list = [
      createMockContribution({ id: 'a' }),
      createMockContribution({ id: 'b', quantity: 5 }),
    ];
    vi.mocked(repository.getContributionsByResource).mockResolvedValue(list);

    const result = await useCase.execute({
      eventId: 'event-1',
      resourceId: 'resource-1',
    });

    expect(repository.getContributionsByResource).toHaveBeenCalledTimes(1);
    expect(repository.getContributionsByResource).toHaveBeenCalledWith({
      eventId: 'event-1',
      resourceId: 'resource-1',
    });
    expect(result).toEqual(list);
  });

  it('returns an empty array when there are no contributions', async () => {
    vi.mocked(repository.getContributionsByResource).mockResolvedValue([]);

    const result = await useCase.execute({
      eventId: 'event-1',
      resourceId: 'resource-1',
    });

    expect(repository.getContributionsByResource).toHaveBeenCalledWith({
      eventId: 'event-1',
      resourceId: 'resource-1',
    });
    expect(result).toEqual([]);
  });
});

describe('UpdateContribution', () => {
  let repository: ContributionRepository;
  let useCase: UpdateContribution;

  beforeEach(() => {
    repository = createMockContributionRepository();
    useCase = new UpdateContribution(repository);
  });

  it('updates a contribution successfully', async () => {
    const updated = createMockContribution({ quantity: 10 });
    vi.mocked(repository.updateContribution).mockResolvedValue(updated);

    const input = {
      eventId: 'event-1',
      resourceId: 'resource-1',
      quantity: 10,
    };

    const result = await useCase.execute(input);

    expect(repository.updateContribution).toHaveBeenCalledTimes(1);
    expect(repository.updateContribution).toHaveBeenCalledWith({
      eventId: 'event-1',
      resourceId: 'resource-1',
      data: { quantity: 10 },
    });
    expect(result).toEqual(updated);
  });
});

describe('DeleteContribution', () => {
  let repository: ContributionRepository;
  let useCase: DeleteContribution;

  beforeEach(() => {
    repository = createMockContributionRepository();
    useCase = new DeleteContribution(repository);
  });

  it('deletes a contribution successfully', async () => {
    vi.mocked(repository.deleteContribution).mockResolvedValue(undefined);

    await useCase.execute({
      eventId: 'event-1',
      resourceId: 'resource-1',
    });

    expect(repository.deleteContribution).toHaveBeenCalledTimes(1);
    expect(repository.deleteContribution).toHaveBeenCalledWith({
      eventId: 'event-1',
      resourceId: 'resource-1',
    });
  });
});
