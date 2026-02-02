import React, { useState } from 'react';
import { EventType } from '../types/Event';
import './CreateEventForm.css';

interface CreateEventFormProps {
  onSubmit: (eventData: {
    name: string;
    description: string;
    date: Date;
    location: string;
    type: EventType;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const getDefaultDateTime = () => {
  const now = new Date();
  // Ajouter 1 heure
  now.setHours(now.getHours() + 1);

  // Format YYYY-MM-DD pour l'input type="date"
  const dateStr = now.toISOString().split('T')[0];

  // Format HH:MM pour l'input type="time"
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  return { date: dateStr, time: timeStr };
};

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const defaultDateTime = getDefaultDateTime();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: defaultDateTime.date,
    time: defaultDateTime.time,
    location: '',
    type: '' as EventType | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters long';
    }

    if (
      !formData.description.trim() ||
      formData.description.trim().length < 3
    ) {
      newErrors.description = 'Description must be at least 3 characters long';
    }

    if (!formData.location.trim() || formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters long';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Please select an event type';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Event time is required';
    }

    // Validate date/time is in the future
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      if (selectedDateTime <= new Date()) {
        newErrors.date = 'Event date and time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Combine date and time into a single Date object
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`);

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: combinedDateTime,
        location: formData.location.trim(),
        type: formData.type as EventType,
      });

      // Reset form on success with new default date/time
      const newDefaultDateTime = getDefaultDateTime();
      setFormData({
        name: '',
        description: '',
        date: newDefaultDateTime.date,
        time: newDefaultDateTime.time,
        location: '',
        type: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleCancel = () => {
    const newDefaultDateTime = getDefaultDateTime();
    setFormData({
      name: '',
      description: '',
      date: newDefaultDateTime.date,
      time: newDefaultDateTime.time,
      location: '',
      type: '',
    });
    setErrors({});
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="create-event-form">
      <div className="form-group">
        <label htmlFor="name">Event Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={errors.name ? 'error' : ''}
          placeholder="Enter event name"
          disabled={isLoading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className={errors.description ? 'error' : ''}
          placeholder="Enter event description"
          disabled={isLoading}
          rows={3}
        />
        {errors.description && (
          <span className="error-message">{errors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">Event Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className={errors.date ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>
        <div className="form-group">
          <label htmlFor="time">Event Time *</label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className={errors.time ? 'error' : ''}
            disabled={isLoading}
            step="300"
          />
          {errors.time && <span className="error-message">{errors.time}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location">Location *</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className={errors.location ? 'error' : ''}
          placeholder="Enter event location"
          disabled={isLoading}
        />
        {errors.location && (
          <span className="error-message">{errors.location}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="type">Event Type *</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className={errors.type ? 'error' : ''}
          disabled={isLoading}
        >
          <option value="">Select event type</option>
          <option value={EventType.PARTY}>Party</option>
          <option value={EventType.BIRTHDAY}>Birthday</option>
          <option value={EventType.DINER}>Diner</option>
          <option value={EventType.SNACK}>Snack</option>
        </select>
        {errors.type && <span className="error-message">{errors.type}</span>}
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="cancel-button"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};
