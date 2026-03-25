export enum ParticipantStatus {
  INVITED = 'INVITED',
  CONFIRMED = 'CONFIRMED',
  MAYBE = 'MAYBE',
  DECLINED = 'DECLINED',
}

export interface Participant {
  id: string;
  userId: string;
  userName?: string;
  eventId: string;
  status: ParticipantStatus;
  joinedAt: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ParticipantCreationRequest {
  eventId: string;
  userId: string;
  userName?: string;
}

export interface ParticipantUpdateRequest {
  status: ParticipantStatus;
}
