import React, { useState } from 'react';
import './CreateEventForm.css';

interface CreateEventFormProps {
  onSubmit: (eventData: {
    name: string;
    date: Date;
    location: string;
    type: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    type: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

    if (!formData.location.trim() || formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters long';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Please select an event type';
    }

    if (!formData.date) {
      newErrors.date = 'Event date is required';
    } else {
      const selectedDate = new Date(formData.date);
      if (selectedDate <= new Date()) {
        newErrors.date = 'Event date must be in the future';
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
      await onSubmit({
        name: formData.name.trim(),
        date: new Date(formData.date),
        location: formData.location.trim(),
        type: formData.type.trim(),
      });

      // Reset form on success
      setFormData({ name: '', date: '', location: '', type: '' });
      setErrors({});
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', date: '', location: '', type: '' });
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
        <label htmlFor="date">Event Date *</label>
        <input
          type="datetime-local"
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
          <option value="party">Party</option>
          <option value="meeting">Meeting</option>
          <option value="conference">Conference</option>
          <option value="workshop">Workshop</option>
          <option value="social">Social Gathering</option>
          <option value="sports">Sports Event</option>
          <option value="other">Other</option>
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
