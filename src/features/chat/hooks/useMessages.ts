import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '../types';
import { fetchMessages, sendMessage } from '../services/chatService';

interface UseMessagesOptions {
  eventId: string;
  token: string | null;
}

export function useMessages({ eventId, token }: UseMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const initialLoadDone = useRef(false);

  const loadMessages = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const page = await fetchMessages(eventId, token);
      setMessages(page.messages);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
      initialLoadDone.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, token]);

  const loadOlder = useCallback(async () => {
    if (!token || !cursorRef.current) return;
    setIsLoading(true);
    try {
      const page = await fetchMessages(eventId, token, cursorRef.current);
      setMessages(prev => [...page.messages, ...prev]);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [eventId, token]);

  const send = useCallback(
    async (content: string) => {
      if (!token) return;
      await sendMessage(eventId, content, token);
    },
    [eventId, token]
  );

  const appendMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  return {
    messages,
    isLoading,
    hasMore,
    error,
    loadMessages,
    loadOlder,
    send,
    appendMessage,
    isReady: initialLoadDone.current,
  };
}
