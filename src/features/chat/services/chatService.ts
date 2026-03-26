import type { MessagesPage } from '../types';

const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL ?? '';

async function request<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${CHAT_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? `Chat API error ${res.status}`
    );
  }

  return res.json() as Promise<T>;
}

export function fetchMessages(
  eventId: string,
  token: string,
  cursor?: string | null,
  limit = 30
): Promise<MessagesPage> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', cursor);

  return request<MessagesPage>(
    `/api/events/${eventId}/messages?${params}`,
    token
  );
}

export function sendMessage(
  eventId: string,
  content: string,
  token: string
): Promise<unknown> {
  return request(`/api/events/${eventId}/messages`, token, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}
