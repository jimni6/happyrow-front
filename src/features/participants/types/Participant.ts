export enum ParticipantStatus {
  INVITED = 'INVITED',
  CONFIRMED = 'CONFIRMED',
  MAYBE = 'MAYBE',
  DECLINED = 'DECLINED',
}

export interface Participant {
  userId: string;
  eventId: string;
  status: ParticipantStatus;
  joinedAt: Date;
  updatedAt?: Date;
}

export interface ParticipantCreationRequest {
  eventId: string;
  userId: string;
  status: ParticipantStatus;
}

export interface ParticipantUpdateRequest {
  status: ParticipantStatus;
}
