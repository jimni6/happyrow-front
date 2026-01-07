import React, { useState, useEffect, useRef, useCallback } from 'react';
import './HomeView.css';
import type { User } from '@/features/auth';
import { useAuth } from '@/features/auth';
import type { Event } from '@/features/events';
import { Modal } from '@/shared/components/Modal';
import { CreateEventForm } from '@/features/events';
import { EventType } from '@/features/events';
import { CreateEvent, GetEventsByOrganizer } from '@/features/events';
import { HttpEventRepository } from '@/features/events';
import { EventDetailsView } from '@/features/events';

interface HomeViewProps {
  user: User;
}

export const HomeView: React.FC<HomeViewProps> = ({ user }) => {
  const { session } = useAuth();
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [createEventError, setCreateEventError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Ref to track if we're currently loading to prevent duplicate calls
  const loadingRef = useRef(false);
  const loadedUserIdRef = useRef<string | null>(null);

  const currentTime = new Date();
  const hour = currentTime.getHours();

  const loadEvents = useCallback(async () => {
    // Prevent duplicate calls for the same user
    if (loadingRef.current || loadedUserIdRef.current === user.id) {
      return;
    }

    // Set flags immediately to prevent concurrent calls
    loadingRef.current = true;
    loadedUserIdRef.current = user.id;

    try {
      setLoadingEvents(true);
      const eventRepository = new HttpEventRepository(
        () => session?.accessToken || null
      );
      const getEventsUseCase = new GetEventsByOrganizer(eventRepository);
      const userEvents = await getEventsUseCase.execute({
        organizerId: user.id,
      });
      setEvents(userEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      // Reset on error to allow retry
      loadedUserIdRef.current = null;
    } finally {
      setLoadingEvents(false);
      loadingRef.current = false;
    }
  }, [user.id, session]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const getGreeting = () => {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
      const eventRepository = new HttpEventRepository(
        () => session?.accessToken || null
      );
      const createEventUseCase = new CreateEvent(eventRepository);

      await createEventUseCase.execute({
        ...eventData,
        organizerId: user.id,
      });

      // Success - close modal and reload events
      setIsCreateEventModalOpen(false);
      loadEvents();
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

  const handleEventUpdated = (updatedEvent: Event) => {
    // Update the event in the local list
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    // Update the selected event
    setSelectedEvent(updatedEvent);
  };

  const handleEventDeleted = () => {
    if (!selectedEvent) return;

    // Remove the event from the local list
    setEvents(prevEvents => prevEvents.filter(e => e.id !== selectedEvent.id));

    // Go back to home screen
    setSelectedEvent(null);
  };

  // Show event details if an event is selected
  if (selectedEvent) {
    return (
      <EventDetailsView
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
        onEventUpdated={handleEventUpdated}
        onEventDeleted={handleEventDeleted}
      />
    );
  }

  return (
    <div className="home-screen">
      <div className="home-header">
        <div className="greeting-section">
          <h1 className="greeting">
            {getGreeting()}, {user.firstname}! 👋
          </h1>
          <p className="date">{formatDate(currentTime)}</p>
        </div>
        <div className="user-info-card">
          <div className="user-avatar">
            {user.firstname.charAt(0).toUpperCase()}
            {user.lastname.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>
              {user.firstname} {user.lastname}
            </h3>
            <p>{user.email}</p>
            <span
              className={`status ${user.emailConfirmed ? 'verified' : 'unverified'}`}
            >
              {user.emailConfirmed ? '✅ Verified' : '⚠️ Unverified'}
            </span>
          </div>
        </div>
      </div>

      <div className="home-content">
        <div className="welcome-card">
          <h2>Welcome to HappyRow! 🎉</h2>
          <p>
            You're successfully logged in and ready to explore all the features
            we have to offer. This is your personal dashboard where you can
            manage your account and access various tools.
          </p>
        </div>

        <div className="events-section">
          <h2>Your Events</h2>
          {loadingEvents ? (
            <div className="loading-events">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="no-events">
              <p>You haven't created any events yet.</p>
              <p>Click "Create Event" below to get started!</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event, index) => (
                <div
                  key={event.id || `event-${index}`}
                  className="event-card"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="event-card-icon">🎉</div>
                  <h3>{event.name}</h3>
                  <p className="event-location">📍 {event.location}</p>
                  <p className="event-date">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                  <button className="view-event-button">View Details →</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button
              className="action-button primary"
              onClick={() => setIsCreateEventModalOpen(true)}
            >
              <span>🎉</span>
              Create Event
            </button>
            <button className="action-button secondary">
              <span>📚</span>
              View Documentation
            </button>
            <button className="action-button secondary">
              <span>💬</span>
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateEventModalOpen}
        onClose={() => {
          setIsCreateEventModalOpen(false);
          setCreateEventError(null);
        }}
        title="Create New Event"
        size="medium"
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
