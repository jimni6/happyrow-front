import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateEvent } from '@/features/events/use-cases/CreateEvent';
import type { CreateEventInput } from '@/features/events/use-cases/CreateEvent';
import { GetEventsByOrganizer } from '@/features/events/use-cases/GetEventsByOrganizer';
import { UpdateEvent } from '@/features/events/use-cases/UpdateEvent';
import { DeleteEvent } from '@/features/events/use-cases/DeleteEvent';
import { GetEventById } from '@/features/events/use-cases/GetEventById';
import type {
  Event,
  EventCreationRequest,
} from '@/features/events/types/Event';
import { EventType } from '@/features/events/types/Event';
import type { EventRepository } from '@/features/events/types/EventRepository';

function futureDate(daysFromNow = 7): Date {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
}

function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 'event-uuid-1',
    name: 'Summer Party',
    description: 'Outdoor celebration with friends',
    date: futureDate(14),
    location: 'Riverside Park',
    type: EventType.PARTY,
    organizerId: 'organizer-1',
    ...overrides,
  };
}

function createMockEventRepository(): EventRepository {
  return {
    createEvent: vi.fn(),
    getEventById: vi.fn(),
    getEventsByOrganizer: vi.fn(),
    updateEvent: vi.fn(),
    deleteEvent: vi.fn(),
  };
}

function validCreateInput(): CreateEventInput {
  return {
    name: 'Birthday Bash',
    description: 'Celebrate with cake and games',
    location: 'Community Hall',
    type: EventType.BIRTHDAY,
    date: futureDate(),
    organizerId: 'organizer-abc',
  };
}

describe('CreateEvent', () => {
  let repository: EventRepository;
  let useCase: CreateEvent;

  beforeEach(() => {
    repository = createMockEventRepository();
    useCase = new CreateEvent(repository);
  });

  it('creates an event successfully and passes trimmed request to the repository', async () => {
    const created = createMockEvent();
    vi.mocked(repository.createEvent).mockResolvedValue(created);

    const input = validCreateInput();
    input.name = '  Trimmed Name  ';
    input.description = '  Nice party  ';
    input.location = '  Downtown  ';

    const result = await useCase.execute(input);

    expect(result).toBe(created);
    expect(repository.createEvent).toHaveBeenCalledTimes(1);

    const call = vi.mocked(repository.createEvent).mock
      .calls[0][0] as EventCreationRequest;
    expect(call.name).toBe('Trimmed Name');
    expect(call.description).toBe('Nice party');
    expect(call.location).toBe('Downtown');
    expect(call.type).toBe(input.type);
    expect(call.organizerId).toBe(input.organizerId);
    expect(call.date).toBe(input.date.toISOString());
  });

  it('rejects when name is missing or too short', async () => {
    await expect(
      useCase.execute({ ...validCreateInput(), name: 'ab' })
    ).rejects.toThrow('Event name must be at least 3 characters long');

    await expect(
      useCase.execute({ ...validCreateInput(), name: '   ' })
    ).rejects.toThrow('Event name must be at least 3 characters long');
  });

  it('rejects when description is missing or too short', async () => {
    await expect(
      useCase.execute({ ...validCreateInput(), description: 'x' })
    ).rejects.toThrow('Event description must be at least 3 characters long');
  });

  it('rejects when location is missing or too short', async () => {
    await expect(
      useCase.execute({ ...validCreateInput(), location: 'no' })
    ).rejects.toThrow('Event location must be at least 3 characters long');
  });

  it('rejects when event type is missing', async () => {
    const input = {
      ...validCreateInput(),
      type: undefined as unknown as EventType,
    };
    await expect(useCase.execute(input)).rejects.toThrow(
      'Event type is required'
    );
  });

  it('rejects when date is missing', async () => {
    const input = {
      ...validCreateInput(),
      date: undefined as unknown as Date,
    };
    await expect(useCase.execute(input)).rejects.toThrow(
      'Event date is required'
    );
  });

  it('rejects when date is not in the future', async () => {
    await expect(
      useCase.execute({
        ...validCreateInput(),
        date: new Date(Date.now() - 60_000),
      })
    ).rejects.toThrow('Event date must be in the future');
  });

  it('rejects when organizer id is missing', async () => {
    await expect(
      useCase.execute({ ...validCreateInput(), organizerId: '' })
    ).rejects.toThrow('Valid organizer ID is required');

    await expect(
      useCase.execute({ ...validCreateInput(), organizerId: '   ' })
    ).rejects.toThrow('Valid organizer ID is required');
  });
});

describe('GetEventsByOrganizer', () => {
  let repository: EventRepository;
  let useCase: GetEventsByOrganizer;

  beforeEach(() => {
    repository = createMockEventRepository();
    useCase = new GetEventsByOrganizer(repository);
  });

  it('returns events for the organizer', async () => {
    const events = [createMockEvent({ id: 'a' }), createMockEvent({ id: 'b' })];
    vi.mocked(repository.getEventsByOrganizer).mockResolvedValue(events);

    const result = await useCase.execute({ organizerId: 'organizer-1' });

    expect(result).toEqual(events);
    expect(repository.getEventsByOrganizer).toHaveBeenCalledWith('organizer-1');
  });

  it('returns an empty array when the organizer has no events', async () => {
    vi.mocked(repository.getEventsByOrganizer).mockResolvedValue([]);

    const result = await useCase.execute({ organizerId: 'solo-organizer' });

    expect(result).toEqual([]);
    expect(repository.getEventsByOrganizer).toHaveBeenCalledWith(
      'solo-organizer'
    );
  });
});

describe('UpdateEvent', () => {
  let repository: EventRepository;
  let useCase: UpdateEvent;

  beforeEach(() => {
    repository = createMockEventRepository();
    useCase = new UpdateEvent(repository);
  });

  it('updates an event successfully when at least one field is provided', async () => {
    const updated = createMockEvent({ name: 'Updated Gala' });
    vi.mocked(repository.updateEvent).mockResolvedValue(updated);

    const result = await useCase.execute({
      id: 'event-1',
      name: 'Updated Gala',
    });

    expect(result).toEqual(updated);
    expect(repository.updateEvent).toHaveBeenCalledWith('event-1', {
      name: 'Updated Gala',
    });
  });
});

describe('DeleteEvent', () => {
  let repository: EventRepository;
  let useCase: DeleteEvent;

  beforeEach(() => {
    repository = createMockEventRepository();
    useCase = new DeleteEvent(repository);
  });

  it('deletes an event successfully', async () => {
    vi.mocked(repository.deleteEvent).mockResolvedValue(undefined);

    await useCase.execute({ id: 'event-to-delete', userId: 'user-42' });

    expect(repository.deleteEvent).toHaveBeenCalledWith(
      'event-to-delete',
      'user-42'
    );
  });
});

describe('GetEventById', () => {
  let repository: EventRepository;
  let useCase: GetEventById;

  beforeEach(() => {
    repository = createMockEventRepository();
    useCase = new GetEventById(repository);
  });

  it('returns the event when found', async () => {
    const event = createMockEvent({ id: 'wanted-id' });
    vi.mocked(repository.getEventById).mockResolvedValue(event);

    const result = await useCase.execute({ id: 'wanted-id' });

    expect(result).toEqual(event);
    expect(repository.getEventById).toHaveBeenCalledWith('wanted-id');
  });

  it('returns null when the event is not found', async () => {
    vi.mocked(repository.getEventById).mockResolvedValue(null);

    const result = await useCase.execute({ id: 'missing-id' });

    expect(result).toBeNull();
    expect(repository.getEventById).toHaveBeenCalledWith('missing-id');
  });
});
