# Backend Contract: Event Chat / Comments

> Issue #83 — `feat: commentaires / chat d'evenement`

## Context

Real-time chat thread on each event for coordination (meeting time, allergies, last-minute changes). The backend provides Supabase which supports Realtime subscriptions, making this a natural fit.

Only event participants (users in the participants list for the event) can read and write messages. Auth via Bearer JWT.

## Decisions

| Decision            | Choice                                                   |
| ------------------- | -------------------------------------------------------- |
| Real-time mechanism | Supabase Realtime (Postgres Changes) on `event_messages` |
| Pagination          | Cursor-based (`before` param), newest first              |
| Delete behavior     | Soft delete (`deletedAt` timestamp)                      |
| Who can delete      | Message author or event organizer                        |
| Max message length  | 2000 characters                                          |
| Access control      | Participants only (INVITED, CONFIRMED, MAYBE)            |

## Data Model

### Table `event_messages`

| Column    | Type      | Notes                    |
| --------- | --------- | ------------------------ |
| id        | UUID      | PK                       |
| eventId   | UUID      | FK to events, indexed    |
| userId    | UUID      | FK to auth.users         |
| userName  | TEXT      | Denormalized for display |
| content   | TEXT      | Max 2000 chars           |
| createdAt | TIMESTAMP | Default now()            |
| updatedAt | TIMESTAMP | Nullable                 |
| deletedAt | TIMESTAMP | Nullable, soft delete    |

Index on `(eventId, createdAt DESC)` for efficient pagination.

## What the Frontend Will Provide

### `POST /events/{eventId}/messages`

```json
{
  "content": "J'apporte le dessert !"
}
```

The backend resolves `userId` and `userName` from the JWT. Content is trimmed and validated (non-empty, max 2000 chars).

### `GET /events/{eventId}/messages`

Query parameters:

- `limit` (optional, default 50, max 100)
- `before` (optional, message UUID for cursor pagination)

### `DELETE /events/{eventId}/messages/{messageId}`

No body. Sets `deletedAt` to current timestamp.

## What the Backend Must Return

### `GET /events/{eventId}/messages` -- response

```json
{
  "messages": [
    {
      "identifier": "uuid-msg-1",
      "eventId": "uuid-event",
      "userId": "uuid-user",
      "userName": "JeanD",
      "content": "J'apporte le dessert !",
      "createdAt": 1711900000000,
      "updatedAt": null,
      "isDeleted": false
    },
    {
      "identifier": "uuid-msg-2",
      "eventId": "uuid-event",
      "userId": "uuid-user-2",
      "userName": "Marie",
      "content": "Super, moi je prends les boissons",
      "createdAt": 1711899000000,
      "updatedAt": null,
      "isDeleted": false
    }
  ],
  "hasMore": true,
  "nextCursor": "uuid-msg-2"
}
```

Messages are sorted by `createdAt DESC` (newest first). Deleted messages are either excluded or returned with `isDeleted: true` and `content: null` (to preserve thread continuity).

### `POST /events/{eventId}/messages` -- response

```
201 Created
```

```json
{
  "identifier": "uuid-new-msg",
  "eventId": "uuid-event",
  "userId": "uuid-user",
  "userName": "JeanD",
  "content": "J'apporte le dessert !",
  "createdAt": 1711900500000,
  "updatedAt": null,
  "isDeleted": false
}
```

### `DELETE /events/{eventId}/messages/{messageId}` -- response

```
204 No Content
```

Returns 403 if the user is neither the message author nor the event organizer. Returns 404 if message not found or already deleted.

## Supabase Realtime

The backend must enable Supabase Realtime on the `event_messages` table so the frontend can subscribe to new messages in real-time.

The frontend subscribes to the channel:

```
event_messages:eventId=eq.{eventId}
```

Listening for `INSERT` events. The frontend does NOT rely on Realtime for UPDATE or DELETE (it uses HTTP for those).

### RLS (Row Level Security)

Supabase RLS policies must ensure:

1. SELECT: user is a participant of the event
2. INSERT: user is a participant of the event
3. UPDATE: user is the message author (for future edit feature)
4. DELETE: user is the message author or event organizer

## API Summary

| Endpoint                                 | Method | Auth   | Description                             |
| ---------------------------------------- | ------ | ------ | --------------------------------------- |
| `/events/{eventId}/messages`             | GET    | Bearer | List messages (paginated, cursor-based) |
| `/events/{eventId}/messages`             | POST   | Bearer | Send a message                          |
| `/events/{eventId}/messages/{messageId}` | DELETE | Bearer | Soft-delete a message                   |

## Field Naming

| Field      | Type           | Required         | Description                        |
| ---------- | -------------- | ---------------- | ---------------------------------- |
| identifier | string         | Response         | Message UUID                       |
| eventId    | string         | Response         | Event UUID                         |
| userId     | string         | Response         | Author UUID (resolved from JWT)    |
| userName   | string         | Response         | Author display name (denormalized) |
| content    | string         | Request/Response | Message text (max 2000 chars)      |
| createdAt  | number         | Response         | Epoch ms                           |
| updatedAt  | number or null | Response         | Epoch ms or null                   |
| isDeleted  | boolean        | Response         | true if soft-deleted               |
| hasMore    | boolean        | Response (list)  | More pages available               |
| nextCursor | string or null | Response (list)  | UUID for next page                 |

## Error Codes

| Status | Condition                              |
| ------ | -------------------------------------- |
| 400    | Empty content or exceeds 2000 chars    |
| 401    | Missing or invalid JWT                 |
| 403    | User is not a participant of the event |
| 404    | Event or message not found             |

## What the Frontend Handles

- Subscribing to Supabase Realtime channel on mount
- Unsubscribing on unmount
- Appending new messages from Realtime events to the list
- Loading older messages on scroll (cursor pagination)
- Optimistic UI for sent messages
- Auto-scroll to newest message
- Displaying deleted messages as "[Message supprime]"
