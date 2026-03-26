import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContributionOperations } from '../useContributionOperations';
import type { Resource } from '../../types/Resource';
import type { AddContribution } from '@/features/contributions/use-cases/AddContribution';
import type { UpdateContribution } from '@/features/contributions/use-cases/UpdateContribution';
import type { DeleteContribution } from '@/features/contributions/use-cases/DeleteContribution';
import type { GetResources } from '../../use-cases/GetResources';

const createMockResource = (overrides: Partial<Resource> = {}): Resource => ({
  id: 'resource-1',
  eventId: 'event-1',
  name: 'Pizza',
  category: 'FOOD' as Resource['category'],
  currentQuantity: 3,
  suggestedQuantity: 10,
  contributors: [],
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

const createMockResourceWithContributor = (
  userId: string,
  quantity: number
): Resource =>
  createMockResource({
    currentQuantity: quantity,
    contributors: [{ userId, quantity, contributedAt: new Date('2024-01-01') }],
  });

const createMockUseCases = () => ({
  addContributionUseCase: {
    execute: vi.fn().mockResolvedValue({
      id: 'contrib-1',
      eventId: 'event-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      quantity: 5,
      createdAt: new Date(),
    }),
  } as unknown as AddContribution,
  updateContributionUseCase: {
    execute: vi.fn().mockResolvedValue({
      id: 'contrib-1',
      eventId: 'event-1',
      resourceId: 'resource-1',
      userId: 'user-1',
      quantity: 8,
      createdAt: new Date(),
    }),
  } as unknown as UpdateContribution,
  deleteContributionUseCase: {
    execute: vi.fn().mockResolvedValue(undefined),
  } as unknown as DeleteContribution,
  getResourcesUseCase: {
    execute: vi.fn().mockResolvedValue([]),
  } as unknown as GetResources,
});

describe('useContributionOperations', () => {
  let mockUseCases: ReturnType<typeof createMockUseCases>;
  let setResources: ReturnType<typeof vi.fn>;
  let setError: ReturnType<typeof vi.fn>;
  let initialResources: Resource[];

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUseCases = createMockUseCases();
    setResources = vi.fn();
    setError = vi.fn();
    initialResources = [createMockResource()];
    // Flush any pending microtasks from previous tests (fire-and-forget syncs)
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  const renderUseContributionOperations = (
    overrides: {
      currentEventId?: string | null;
      resources?: Resource[];
    } = {}
  ) =>
    renderHook(() =>
      useContributionOperations({
        ...mockUseCases,
        currentEventId:
          'currentEventId' in overrides ? overrides.currentEventId! : 'event-1',
        resources: overrides.resources ?? initialResources,
        setResources,
        setError,
      })
    );

  describe('addContribution — optimistic update', () => {
    it('should update state optimistically before API call resolves', async () => {
      let resolveApi: () => void;
      const apiPromise = new Promise<void>(resolve => {
        resolveApi = resolve;
      });
      (
        mockUseCases.addContributionUseCase.execute as ReturnType<typeof vi.fn>
      ).mockReturnValue(apiPromise);

      const { result } = renderUseContributionOperations();

      // Start the add — don't await yet
      const addPromise = act(async () => {
        await result.current.addContribution('resource-1', 'user-1', 5);
      });

      // setResources should have been called with an updater function (optimistic update)
      // BEFORE the API call resolves
      expect(setResources).toHaveBeenCalledTimes(1);
      const updater = setResources.mock.calls[0][0];
      expect(typeof updater).toBe('function');

      // Apply the updater to verify the optimistic state
      const optimisticState = updater(initialResources);
      expect(optimisticState[0].currentQuantity).toBe(8); // 3 + 5
      expect(optimisticState[0].contributors).toHaveLength(1);
      expect(optimisticState[0].contributors[0].userId).toBe('user-1');
      expect(optimisticState[0].contributors[0].quantity).toBe(5);

      // Now resolve the API call
      resolveApi!();
      await addPromise;
    });

    it('should call the API with correct parameters', async () => {
      const { result } = renderUseContributionOperations();

      await act(async () => {
        await result.current.addContribution('resource-1', 'user-1', 5);
      });

      expect(mockUseCases.addContributionUseCase.execute).toHaveBeenCalledWith({
        eventId: 'event-1',
        resourceId: 'resource-1',
        userId: 'user-1',
        quantity: 5,
      });
    });

    it('should NOT trigger background sync after successful API call (optimistic data is sufficient)', async () => {
      const { result } = renderUseContributionOperations();

      await act(async () => {
        await result.current.addContribution('resource-1', 'user-1', 5);
      });

      // No sync — optimistic update is the source of truth
      expect(mockUseCases.getResourcesUseCase.execute).not.toHaveBeenCalled();
    });

    it('should rollback to previous state on API error', async () => {
      (
        mockUseCases.addContributionUseCase.execute as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));

      const { result } = renderUseContributionOperations();

      await act(async () => {
        try {
          await result.current.addContribution('resource-1', 'user-1', 5);
        } catch {
          // Expected to throw
        }
      });

      // First call = optimistic update, second call = rollback
      expect(setResources).toHaveBeenCalledTimes(2);
      // The rollback call should restore the original resources
      expect(setResources.mock.calls[1][0]).toEqual(initialResources);
    });

    it('should set error message on API failure', async () => {
      (
        mockUseCases.addContributionUseCase.execute as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Network error'));

      const { result } = renderUseContributionOperations();

      await act(async () => {
        try {
          await result.current.addContribution('resource-1', 'user-1', 5);
        } catch {
          // Expected
        }
      });

      expect(setError).toHaveBeenCalledWith(
        expect.stringContaining('Network error')
      );
    });

    it('should throw when no event context', async () => {
      const { result } = renderUseContributionOperations({
        currentEventId: null,
      });

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.addContribution('resource-1', 'user-1', 5);
        } catch (err) {
          thrownError = err as Error;
        }
      });
      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError!.message).toBe('No event context available');
    });

    it('should not modify other resources during optimistic update', async () => {
      const resources = [
        createMockResource({ id: 'resource-1', name: 'Pizza' }),
        createMockResource({
          id: 'resource-2',
          name: 'Soda',
          currentQuantity: 5,
        }),
      ];

      const { result } = renderUseContributionOperations({ resources });

      await act(async () => {
        await result.current.addContribution('resource-1', 'user-1', 3);
      });

      const updater = setResources.mock.calls[0][0];
      const optimisticState = updater(resources);

      expect(optimisticState[0].currentQuantity).toBe(6); // 3 + 3
      expect(optimisticState[1].currentQuantity).toBe(5); // unchanged
      expect(optimisticState[1].contributors).toHaveLength(0); // unchanged
    });
  });

  describe('updateContribution — optimistic update', () => {
    it('should optimistically update quantity and contributor data', async () => {
      const resources = [createMockResourceWithContributor('user-1', 3)];

      const { result } = renderUseContributionOperations({ resources });

      await act(async () => {
        await result.current.updateContribution('resource-1', 'user-1', 8);
      });

      const updater = setResources.mock.calls[0][0];
      const optimisticState = updater(resources);

      // currentQuantity: was 3 (old) → 3 - 3 + 8 = 8
      expect(optimisticState[0].currentQuantity).toBe(8);
      expect(optimisticState[0].contributors[0].quantity).toBe(8);
      expect(optimisticState[0].contributors[0].userId).toBe('user-1');
    });

    it('should rollback on API error', async () => {
      const resources = [createMockResourceWithContributor('user-1', 3)];

      (
        mockUseCases.updateContributionUseCase.execute as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(new Error('Conflict'));

      const { result } = renderUseContributionOperations({ resources });

      await act(async () => {
        try {
          await result.current.updateContribution('resource-1', 'user-1', 8);
        } catch {
          // Expected
        }
      });

      // First call = optimistic, second call = rollback
      expect(setResources).toHaveBeenCalledTimes(2);
      expect(setResources.mock.calls[1][0]).toEqual(resources);
    });

    it('should call API with correct parameters', async () => {
      const resources = [createMockResourceWithContributor('user-1', 3)];

      const { result } = renderUseContributionOperations({ resources });

      await act(async () => {
        await result.current.updateContribution('resource-1', 'user-1', 8);
      });

      expect(
        mockUseCases.updateContributionUseCase.execute
      ).toHaveBeenCalledWith({
        eventId: 'event-1',
        resourceId: 'resource-1',
        quantity: 8,
      });
    });

    it('should preserve other contributors during update', async () => {
      const resources = [
        createMockResource({
          currentQuantity: 10,
          contributors: [
            { userId: 'user-1', quantity: 3, contributedAt: new Date() },
            { userId: 'user-2', quantity: 7, contributedAt: new Date() },
          ],
        }),
      ];

      const { result } = renderUseContributionOperations({ resources });

      await act(async () => {
        await result.current.updateContribution('resource-1', 'user-1', 5);
      });

      const updater = setResources.mock.calls[0][0];
      const optimisticState = updater(resources);

      // currentQuantity: 10 - 3 (old user-1) + 5 (new user-1) = 12
      expect(optimisticState[0].currentQuantity).toBe(12);
      expect(optimisticState[0].contributors).toHaveLength(2);
      expect(
        optimisticState[0].contributors.find(
          (c: { userId: string }) => c.userId === 'user-1'
        ).quantity
      ).toBe(5);
      expect(
        optimisticState[0].contributors.find(
          (c: { userId: string }) => c.userId === 'user-2'
        ).quantity
      ).toBe(7);
    });
  });

  describe('deleteContribution', () => {
    it('should call API and sync after success', async () => {
      const { result } = renderUseContributionOperations();

      await act(async () => {
        await result.current.deleteContribution('resource-1');
      });

      expect(
        mockUseCases.deleteContributionUseCase.execute
      ).toHaveBeenCalledWith({
        eventId: 'event-1',
        resourceId: 'resource-1',
      });

      expect(mockUseCases.getResourcesUseCase.execute).toHaveBeenCalledWith({
        eventId: 'event-1',
      });
    });

    it('should set error on API failure', async () => {
      (
        mockUseCases.deleteContributionUseCase.execute as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderUseContributionOperations();

      await act(async () => {
        try {
          await result.current.deleteContribution('resource-1');
        } catch {
          // Expected
        }
      });

      expect(setError).toHaveBeenCalledWith(
        expect.stringContaining('Delete failed')
      );
    });

    it('should throw when no event context', async () => {
      const { result } = renderUseContributionOperations({
        currentEventId: null,
      });

      let thrownError: Error | null = null;
      await act(async () => {
        try {
          await result.current.deleteContribution('resource-1');
        } catch (err) {
          thrownError = err as Error;
        }
      });
      expect(thrownError).toBeInstanceOf(Error);
      expect(thrownError!.message).toBe('No event context available');
    });
  });

  describe('refreshResource', () => {
    it('should fetch and set resources', async () => {
      const freshResources = [createMockResource({ currentQuantity: 99 })];
      (
        mockUseCases.getResourcesUseCase.execute as ReturnType<typeof vi.fn>
      ).mockResolvedValue(freshResources);

      const { result } = renderUseContributionOperations();

      await act(async () => {
        await result.current.refreshResource();
      });

      expect(mockUseCases.getResourcesUseCase.execute).toHaveBeenCalledWith({
        eventId: 'event-1',
      });
      expect(setResources).toHaveBeenCalledWith(freshResources);
    });

    it('should not fetch if no event context', async () => {
      // Create fresh mocks to avoid contamination from fire-and-forget syncs
      const freshUseCases = createMockUseCases();
      const freshSetResources = vi.fn();
      const freshSetError = vi.fn();

      const { result } = renderHook(() =>
        useContributionOperations({
          ...freshUseCases,
          currentEventId: null,
          resources: [],
          setResources: freshSetResources,
          setError: freshSetError,
        })
      );

      await act(async () => {
        await result.current.refreshResource();
      });

      expect(freshUseCases.getResourcesUseCase.execute).not.toHaveBeenCalled();
    });
  });
});
