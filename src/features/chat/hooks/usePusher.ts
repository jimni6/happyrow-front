import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import type { ChatMessage } from '../types';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY ?? '';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER ?? 'eu';

interface UsePusherOptions {
  eventId: string;
  onNewMessage: (message: ChatMessage) => void;
  enabled?: boolean;
}

export function usePusher({
  eventId,
  onNewMessage,
  enabled = true,
}: UsePusherOptions) {
  const callbackRef = useRef(onNewMessage);
  callbackRef.current = onNewMessage;

  useEffect(() => {
    if (!enabled || !PUSHER_KEY || !eventId) return;

    const pusher = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    const channel = pusher.subscribe(`event-${eventId}`);

    channel.bind('new-message', (data: ChatMessage) => {
      callbackRef.current(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`event-${eventId}`);
      pusher.disconnect();
    };
  }, [eventId, enabled]);
}
