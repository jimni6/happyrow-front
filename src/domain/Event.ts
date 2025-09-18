export interface Event {
  id: number;
  name: string;
  date: Date;
  location: string;
  type: string;
  organizerId: string; // Changed to string to match User.id
}

export interface EventCreation {
  name: string;
  date: Date;
  location: string;
  type: string;
  organizerId: string; // Changed to string to match User.id
}

export interface EventCreationRequest {
  name: string;
  date: string; // ISO string for API communication
  location: string;
  type: string;
  organizerId: string; // Changed to string to match User.id
}
