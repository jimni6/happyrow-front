import { useContext } from 'react';
import { EventsContext } from './EventsContext';

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error('useEvents must be used within EventsProvider');
  }
  return context;
};
