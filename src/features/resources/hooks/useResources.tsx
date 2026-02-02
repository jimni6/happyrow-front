import { useContext } from 'react';
import { ResourcesContext } from './ResourcesContext';

export const useResources = () => {
  const context = useContext(ResourcesContext);
  if (!context) {
    throw new Error('useResources must be used within ResourcesProvider');
  }
  return context;
};
