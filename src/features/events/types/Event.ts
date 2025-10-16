export enum EventType {
  PARTY = 'PARTY',
  BIRTHDAY = 'BIRTHDAY',
  DINER = 'DINER',
  SNACK = 'SNACK',
}

export interface Event {
  id: string; // Backend uses UUID string identifiers
  name: string;
  description: string;
  date: Date;
  location: string;
  type: EventType;
  organizerId: string;
}

export interface EventCreationRequest {
  name: string;
  description: string;
  date: string; // ISO string for API communication
  location: string;
  type: EventType;
  organizerId: string;
}
