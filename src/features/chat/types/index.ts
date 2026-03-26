export interface ChatMessage {
  id: string;
  eventId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
}

export interface MessagesPage {
  messages: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}
