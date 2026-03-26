import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddParticipant } from '@/features/participants/use-cases/AddParticipant';
import { GetParticipants } from '@/features/participants/use-cases/GetParticipants';
import { RemoveParticipant } from '@/features/participants/use-cases/RemoveParticipant';
import { UpdateParticipantStatus } from '@/features/participants/use-cases/UpdateParticipantStatus';
import type { ParticipantRepository } from '@/features/participants/types/ParticipantRepository';
import {
  ParticipantStatus,
  type Participant,
} from '@/features/participants/types/Participant';

const FIXED_DATE = new Date('2024-06-15T12:00:00.000Z');

function createMockParticipant(overrides?: Partial<Participant>): Participant {
  return {
    id: 'participant-1',
    userId: 'user-1',
    userName: 'Test User',
    eventId: 'event-1',
    status: ParticipantStatus.CONFIRMED,
    joinedAt: FIXED_DATE,
    createdAt: FIXED_DATE,
    ...overrides,
  };
}

function createMockParticipantRepository(): ParticipantRepository {
  return {
    addParticipant: vi.fn(),
    getParticipantsByEvent: vi.fn(),
    updateParticipantStatus: vi.fn(),
    removeParticipant: vi.fn(),
  };
}

describe('Participant use cases', () => {
  let repository: ParticipantRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = createMockParticipantRepository();
  });

  describe('AddParticipant', () => {
    it('adds a participant successfully', async () => {
      const added = createMockParticipant({
        id: 'new-participant',
        userId: 'user-42',
        userName: 'Jane',
        eventId: 'event-99',
        status: ParticipantStatus.INVITED,
      });
      vi.mocked(repository.addParticipant).mockResolvedValue(added);

      const useCase = new AddParticipant(repository);
      const result = await useCase.execute({
        eventId: 'event-99',
        userId: 'user-42',
        userName: 'Jane',
      });

      expect(result).toEqual(added);
      expect(repository.addParticipant).toHaveBeenCalledTimes(1);
      expect(repository.addParticipant).toHaveBeenCalledWith({
        eventId: 'event-99',
        userId: 'user-42',
        userName: 'Jane',
      });
    });
  });

  describe('GetParticipants', () => {
    it('returns participants for an event', async () => {
      const list = [
        createMockParticipant({ id: 'p1', userId: 'u1' }),
        createMockParticipant({
          id: 'p2',
          userId: 'u2',
          status: ParticipantStatus.MAYBE,
        }),
      ];
      vi.mocked(repository.getParticipantsByEvent).mockResolvedValue(list);

      const useCase = new GetParticipants(repository);
      const result = await useCase.execute({ eventId: 'event-1' });

      expect(result).toEqual(list);
      expect(repository.getParticipantsByEvent).toHaveBeenCalledTimes(1);
      expect(repository.getParticipantsByEvent).toHaveBeenCalledWith('event-1');
    });

    it('returns an empty array when there are no participants', async () => {
      vi.mocked(repository.getParticipantsByEvent).mockResolvedValue([]);

      const useCase = new GetParticipants(repository);
      const result = await useCase.execute({ eventId: 'event-empty' });

      expect(result).toEqual([]);
      expect(repository.getParticipantsByEvent).toHaveBeenCalledWith(
        'event-empty'
      );
    });
  });

  describe('RemoveParticipant', () => {
    it('removes a participant successfully', async () => {
      vi.mocked(repository.removeParticipant).mockResolvedValue(undefined);

      const useCase = new RemoveParticipant(repository);
      await useCase.execute({ eventId: 'event-1', userId: 'user-1' });

      expect(repository.removeParticipant).toHaveBeenCalledTimes(1);
      expect(repository.removeParticipant).toHaveBeenCalledWith(
        'event-1',
        'user-1'
      );
    });
  });

  describe('UpdateParticipantStatus', () => {
    it('updates participant status', async () => {
      const updated = createMockParticipant({
        status: ParticipantStatus.DECLINED,
        updatedAt: new Date('2024-06-16T00:00:00.000Z'),
      });
      vi.mocked(repository.updateParticipantStatus).mockResolvedValue(updated);

      const useCase = new UpdateParticipantStatus(repository);
      const result = await useCase.execute({
        eventId: 'event-1',
        userId: 'user-1',
        status: ParticipantStatus.DECLINED,
      });

      expect(result).toEqual(updated);
      expect(repository.updateParticipantStatus).toHaveBeenCalledTimes(1);
      expect(repository.updateParticipantStatus).toHaveBeenCalledWith(
        'event-1',
        'user-1',
        { status: ParticipantStatus.DECLINED }
      );
    });
  });
});
