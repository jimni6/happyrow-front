import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import type { User, AuthRepository } from '@/features/auth';
import { AppNavbar } from '@/shared/components/AppNavbar';
import { Modal } from '@/shared/components/Modal';
import { CreateEventForm } from '@/features/events';
import { EventType } from '@/features/events';
import { useEvents } from '@/features/events';
import './AppLayout.css';

interface AppLayoutProps {
  user: User;
  authRepository: AuthRepository;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ user }) => {
  const { addEvent } = useEvents();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);

  const handleCreateEvent = async (eventData: {
    name: string;
    description: string;
    date: Date;
    location: string;
    type: EventType;
  }) => {
    setIsCreatingEvent(true);
    setCreateEventError(null);

    try {
      await addEvent({
        ...eventData,
        organizerId: user.id,
      });

      // Success - close modal
      setIsCreateEventModalOpen(false);
      console.log('Event created successfully!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create event';
      setCreateEventError(errorMessage);
      console.error('Error creating event:', error);
      throw error; // Re-throw to let modal handle it
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return (
    <div className="app">
      <main className="app-main">
        <Outlet />
      </main>

      <AppNavbar onCreateEvent={() => setIsCreateEventModalOpen(true)} />

      <Modal
        isOpen={isCreateEventModalOpen}
        onClose={() => {
          setIsCreateEventModalOpen(false);
          setCreateEventError(null);
        }}
        title="Create new event"
        size="medium"
        variant="create-event"
      >
        <CreateEventForm
          onSubmit={handleCreateEvent}
          onCancel={() => {
            setIsCreateEventModalOpen(false);
            setCreateEventError(null);
          }}
          isLoading={isCreatingEvent}
        />
      </Modal>

      {createEventError && (
        <div className="error-toast">{createEventError}</div>
      )}
    </div>
  );
};
