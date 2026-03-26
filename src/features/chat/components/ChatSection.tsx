import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/features/auth';
import { useMessages } from '../hooks/useMessages';
import { usePusher } from '../hooks/usePusher';
import type { ChatMessage } from '../types';
import { CommentCard } from './CommentCard';
import { CommentInput } from './CommentInput';
import './ChatSection.css';

interface ChatSectionProps {
  eventId: string;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ eventId }) => {
  const { user, session } = useAuth();
  const token = session?.accessToken ?? null;

  const {
    messages,
    isLoading,
    hasMore,
    error,
    loadMessages,
    loadOlder,
    send,
    appendMessage,
  } = useMessages({ eventId, token });

  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNewMessage = useCallback(
    (message: ChatMessage) => {
      appendMessage(message);
      if (!shouldAutoScroll.current) {
        setUnreadCount(prev => prev + 1);
      }
    },
    [appendMessage]
  );

  usePusher({
    eventId,
    onNewMessage: handleNewMessage,
    enabled: !!token,
  });

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (shouldAutoScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    shouldAutoScroll.current = isNearBottom;

    if (isNearBottom && unreadCount > 0) {
      setUnreadCount(0);
    }

    if (el.scrollTop < 40 && hasMore && !isLoading) {
      const prevHeight = el.scrollHeight;
      loadOlder().then(() => {
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop =
              scrollRef.current.scrollHeight - prevHeight;
          }
        });
      });
    }
  }, [hasMore, isLoading, loadOlder, unreadCount]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      shouldAutoScroll.current = true;
      setUnreadCount(0);
    }
  }, []);

  const handleSend = async (content: string) => {
    await send(content);
    shouldAutoScroll.current = true;
    setUnreadCount(0);
  };

  const handleInputFocus = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current
        ?.closest('.chat-section')
        ?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    });
  }, []);

  return (
    <section className="chat-section" aria-label="Discussion">
      <div className="chat-section__header">
        <h2 className="chat-section__title">
          <span className="meta-icon" aria-hidden="true">
            💬
          </span>{' '}
          Discussion
          {messages.length > 0 && (
            <span className="chat-section__count">({messages.length})</span>
          )}
        </h2>
      </div>

      <div className="chat-section__scroll-wrapper">
        <div
          className="chat-section__scroll"
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {isLoading && messages.length === 0 && (
            <p className="chat-section__empty">Chargement…</p>
          )}

          {!isLoading && messages.length === 0 && !error && (
            <p className="chat-section__empty">
              Aucun message pour le moment. Lancez la discussion !
            </p>
          )}

          {error && <p className="chat-section__error">{error}</p>}

          {hasMore && messages.length > 0 && (
            <button
              className="chat-section__load-more"
              onClick={loadOlder}
              disabled={isLoading}
            >
              {isLoading ? 'Chargement…' : 'Messages plus anciens'}
            </button>
          )}

          {messages.map(msg => (
            <CommentCard
              key={msg.id}
              message={msg}
              isOwn={msg.authorId === user?.id}
            />
          ))}
        </div>

        {unreadCount > 0 && (
          <button
            className="chat-section__unread-pill"
            onClick={scrollToBottom}
            aria-label={`${unreadCount} nouveau${unreadCount > 1 ? 'x' : ''} message${unreadCount > 1 ? 's' : ''}`}
          >
            ↓ {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''} message
            {unreadCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      <CommentInput
        onSend={handleSend}
        disabled={!token}
        onFocus={handleInputFocus}
      />
    </section>
  );
};
