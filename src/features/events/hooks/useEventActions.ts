import { useState, useCallback } from 'react';
import type { Event, EventType } from '../types/Event';
import type { User } from '@/features/auth';
import { useEvents } from './useEvents';

interface UseEventActionsParams {
  event: Event;
  user: User | null;
  onEventUpdated?: (updatedEvent: Event) => void;
  onEventDeleted?: () => void;
}

export function useEventActions({
  event,
  user,
  onEventUpdated,
  onEventDeleted,
}: UseEventActionsParams) {
  const { updateEvent, deleteEvent } = useEvents();

  const [currentEvent, setCurrentEvent] = useState<Event>(event);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const syncEvent = useCallback((e: Event) => {
    setCurrentEvent(e);
  }, []);

  const handleUpdateEvent = useCallback(
    async (eventData: {
      name: string;
      description: string;
      date: Date;
      location: string;
      type: EventType;
    }) => {
      if (!user) return;

      try {
        setIsUpdating(true);
        setError(null);

        const updatedEvent = await updateEvent(currentEvent.id, {
          name: eventData.name,
          description: eventData.description,
          date: eventData.date.toISOString(),
          location: eventData.location,
          type: eventData.type,
          organizerId: user.id,
        });

        setCurrentEvent(updatedEvent);
        setIsEditModalOpen(false);

        onEventUpdated?.(updatedEvent);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update event');
        console.error('Error updating event:', err);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [user, currentEvent.id, updateEvent, onEventUpdated]
  );

  const handleDeleteEvent = useCallback(async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      setError(null);

      await deleteEvent(currentEvent.id, user.id);

      setIsDeleteModalOpen(false);

      onEventDeleted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      console.error('Error deleting event:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [user, currentEvent.id, deleteEvent, onEventDeleted]);

  const clearError = useCallback(() => setError(null), []);

  return {
    currentEvent,
    syncEvent,
    error,
    setError,
    clearError,
    isEditModalOpen,
    setIsEditModalOpen,
    isUpdating,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    isDeleting,
    handleUpdateEvent,
    handleDeleteEvent,
  };
}
