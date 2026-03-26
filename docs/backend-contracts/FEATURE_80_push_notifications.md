# Backend Contract: Push Notifications (PWA)

> Issue #80 — `feat: notifications push (PWA)`

## Context

The app is already a PWA with a basic service worker. Push notifications are needed to keep participants engaged: notify on new invitations, event reminders, new contributions, and event detail changes.

The backend must store Web Push subscriptions, manage user notification preferences, and send push messages (RFC 8030 / VAPID) when triggering events occur.

## Decisions

| Decision                  | Choice                                                                   |
| ------------------------- | ------------------------------------------------------------------------ |
| Push protocol             | Web Push (RFC 8030) with VAPID keys                                      |
| Subscription storage      | Backend table `push_subscriptions`                                       |
| Preference granularity    | Per notification type (invitation, reminder, contribution, event change) |
| Reminder timing           | Configurable per user (default 24h before event)                         |
| Dead subscription cleanup | Backend removes subscription on 410 Gone from push service               |

## Data Model

### Table `push_subscriptions`

| Column    | Type      | Notes                    |
| --------- | --------- | ------------------------ |
| id        | UUID      | PK                       |
| userId    | UUID      | FK to auth.users         |
| endpoint  | TEXT      | Unique push endpoint URL |
| p256dh    | TEXT      | Client public key        |
| auth      | TEXT      | Auth secret              |
| userAgent | TEXT      | Optional, for debugging  |
| createdAt | TIMESTAMP |                          |
| updatedAt | TIMESTAMP |                          |

Unique constraint on `(userId, endpoint)`.

### Table `notification_preferences`

| Column              | Type    | Default              |
| ------------------- | ------- | -------------------- |
| userId              | UUID    | PK, FK to auth.users |
| onInvitation        | BOOLEAN | true                 |
| onReminder          | BOOLEAN | true                 |
| onContribution      | BOOLEAN | true                 |
| onEventChange       | BOOLEAN | true                 |
| reminderHoursBefore | INT     | 24                   |

## What the Frontend Will Provide

### `POST /notifications/subscribe`

Register a push subscription after the user grants notification permission.

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BNcR...",
    "auth": "tBHI..."
  }
}
```

### `DELETE /notifications/subscribe`

Unsubscribe a specific endpoint.

```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

### `PUT /notifications/preferences`

Update notification preferences (all fields optional).

```json
{
  "onInvitation": true,
  "onReminder": true,
  "onContribution": false,
  "onEventChange": true,
  "reminderHoursBefore": 1
}
```

## What the Backend Must Return

### `POST /notifications/subscribe` -- response

```
201 Created (or 200 OK if upsert)
```

```json
{
  "message": "Subscription registered"
}
```

### `DELETE /notifications/subscribe` -- response

```
204 No Content
```

### `GET /notifications/preferences` -- response

```json
{
  "onInvitation": true,
  "onReminder": true,
  "onContribution": true,
  "onEventChange": true,
  "reminderHoursBefore": 24
}
```

If no preferences exist yet, return defaults.

### `PUT /notifications/preferences` -- response

Returns the updated preferences (same shape as GET).

## Push Notification Triggers

The backend must send push notifications when these events occur, respecting user preferences:

### 1. New Invitation (type: `INVITATION`)

Trigger: participant added to event (`POST /events/{eventId}/participants`).

```json
{
  "title": "Nouvelle invitation",
  "body": "{organizerName} t'a invite a {eventName}",
  "icon": "/icons/icon-192x192.png",
  "data": {
    "type": "INVITATION",
    "eventId": "uuid",
    "url": "/events/{eventId}"
  }
}
```

### 2. Event Reminder (type: `REMINDER`)

Trigger: scheduled job, `reminderHoursBefore` before event date. Notify all CONFIRMED participants.

```json
{
  "title": "Rappel",
  "body": "{eventName} commence dans {hours}h",
  "icon": "/icons/icon-192x192.png",
  "data": {
    "type": "REMINDER",
    "eventId": "uuid",
    "url": "/events/{eventId}"
  }
}
```

### 3. New Contribution (type: `CONTRIBUTION`)

Trigger: contribution created (`POST .../contributions`). Notify event organizer.

```json
{
  "title": "Nouvelle contribution",
  "body": "{userName} apporte {quantity} {resourceName}",
  "icon": "/icons/icon-192x192.png",
  "data": {
    "type": "CONTRIBUTION",
    "eventId": "uuid",
    "url": "/events/{eventId}"
  }
}
```

### 4. Event Details Changed (type: `EVENT_CHANGE`)

Trigger: event updated (`PUT /events/{id}`) with date or location change. Notify all participants.

```json
{
  "title": "Evenement modifie",
  "body": "{eventName} a ete mis a jour",
  "icon": "/icons/icon-192x192.png",
  "data": {
    "type": "EVENT_CHANGE",
    "eventId": "uuid",
    "url": "/events/{eventId}"
  }
}
```

## API Summary

| Endpoint                     | Method | Auth   | Description                     |
| ---------------------------- | ------ | ------ | ------------------------------- |
| `/notifications/subscribe`   | POST   | Bearer | Register push subscription      |
| `/notifications/subscribe`   | DELETE | Bearer | Remove push subscription        |
| `/notifications/preferences` | GET    | Bearer | Get notification preferences    |
| `/notifications/preferences` | PUT    | Bearer | Update notification preferences |

## Field Naming

| Field               | Type    | Description                               |
| ------------------- | ------- | ----------------------------------------- |
| endpoint            | string  | Web Push endpoint URL                     |
| keys.p256dh         | string  | Client ECDH public key                    |
| keys.auth           | string  | Client auth secret                        |
| onInvitation        | boolean | Notify on new invitation                  |
| onReminder          | boolean | Notify before event                       |
| onContribution      | boolean | Notify on new contribution (organizer)    |
| onEventChange       | boolean | Notify on event detail changes            |
| reminderHoursBefore | number  | Hours before event for reminder (1 or 24) |

## Backend Responsibilities

- Generate and store VAPID key pair (server-side config)
- Send Web Push messages using stored subscriptions
- Respect user preferences before sending
- Handle 410 Gone from push services (remove dead subscriptions)
- Run a scheduled job for event reminders (cron or Supabase Edge Function)
- Idempotency: do NOT send duplicate notifications

## What the Frontend Handles

- Requesting notification permission at the right moment (not on first load)
- Subscribing via `PushManager.subscribe()` with the server's VAPID public key
- Sending the subscription to `POST /notifications/subscribe`
- Displaying notifications via service worker `push` event handler
- Navigating to the correct page on notification click (`notificationclick` event)
- Preferences UI to toggle notification types
