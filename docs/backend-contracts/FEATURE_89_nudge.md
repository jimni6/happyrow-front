# Backend Contract: Nudge / Reminder System

> Issue #89 — `feat: systeme de nudge / relance des invites`

## Context

The organizer can nudge guests who haven't responded to the invitation or who haven't contributed any resources. Includes cooldown and anti-spam logic.

Auth: Bearer JWT. Only the event organizer can send nudges.

## Decisions

| Decision             | Choice                                                             |
| -------------------- | ------------------------------------------------------------------ |
| Who can nudge        | Event organizer only                                               |
| Cooldown             | 24 hours between nudges to the same user for the same type         |
| Max nudges           | 3 per user per event per type                                      |
| Nudge types          | NO_RESPONSE (no status change), NO_CONTRIBUTION (no contributions) |
| Notification channel | Push notification (from #80) or email                              |

## Data Model

### Table `nudge_history`

| Column           | Type        | Notes                              |
| ---------------- | ----------- | ---------------------------------- |
| id               | UUID        | PK                                 |
| eventId          | UUID        | FK to events                       |
| senderId         | UUID        | FK to auth.users (organizer)       |
| targetUserId     | UUID        | FK to auth.users                   |
| type             | VARCHAR(20) | 'NO_RESPONSE' or 'NO_CONTRIBUTION' |
| sentAt           | TIMESTAMP   |                                    |
| notificationSent | BOOLEAN     | Whether push/email was delivered   |

## What the Frontend Will Provide

### `POST /events/{eventId}/nudge`

Send nudge to specific users or all pending users.

```json
{
  "targetUserIds": ["uuid-user-1", "uuid-user-2"],
  "type": "NO_RESPONSE"
}
```

Or for bulk nudge:

```json
{
  "targetUserIds": "all_pending",
  "type": "NO_RESPONSE"
}
```

`"all_pending"` means: all participants with status INVITED (no response) for NO_RESPONSE type, or all participants with 0 contributions for NO_CONTRIBUTION type.

## What the Backend Must Return

### `POST /events/{eventId}/nudge` -- response

```json
{
  "sent": [
    {
      "userId": "uuid-user-1",
      "userName": "Marie",
      "type": "NO_RESPONSE",
      "sentAt": 1711900000000
    }
  ],
  "skipped": [
    {
      "userId": "uuid-user-2",
      "userName": "Paul",
      "reason": "COOLDOWN_ACTIVE",
      "retryAfter": 1711950000000
    }
  ]
}
```

Possible skip reasons:

- `COOLDOWN_ACTIVE`: nudged less than 24h ago
- `MAX_NUDGES_REACHED`: already nudged 3 times for this type
- `ALREADY_RESPONDED`: participant already changed status (for NO_RESPONSE)
- `ALREADY_CONTRIBUTED`: participant already has contributions (for NO_CONTRIBUTION)

If ALL targets are skipped, return `429 Too Many Requests` with `Retry-After` header.

### `GET /events/{eventId}/nudge/history` -- response

Nudge history for the event (organizer only).

```json
{
  "nudges": [
    {
      "identifier": "uuid",
      "targetUserId": "uuid-user-1",
      "targetUserName": "Marie",
      "type": "NO_RESPONSE",
      "sentAt": 1711900000000,
      "nudgeCount": 2,
      "maxNudges": 3
    }
  ]
}
```

### Notification payload

The backend sends a push notification to nudged users:

```json
{
  "title": "Rappel",
  "body": "{organizerName} te rappelle de repondre a {eventName}",
  "icon": "/icons/icon-192x192.png",
  "data": {
    "type": "NUDGE",
    "eventId": "uuid",
    "url": "/events/{eventId}"
  }
}
```

## API Summary

| Endpoint                          | Method | Auth               | Description   |
| --------------------------------- | ------ | ------------------ | ------------- |
| `/events/{eventId}/nudge`         | POST   | Bearer (organizer) | Send nudge(s) |
| `/events/{eventId}/nudge/history` | GET    | Bearer (organizer) | Nudge history |

## Field Naming

| Field         | Type                      | Description                         |
| ------------- | ------------------------- | ----------------------------------- |
| targetUserIds | string[] or "all_pending" | Request: who to nudge               |
| type          | string                    | "NO_RESPONSE" or "NO_CONTRIBUTION"  |
| sent          | object[]                  | Response: successfully nudged users |
| skipped       | object[]                  | Response: users skipped with reason |
| reason        | string                    | Skip reason code                    |
| retryAfter    | number                    | Epoch ms when cooldown expires      |
| nudgeCount    | number                    | Times nudged for this type          |
| maxNudges     | number                    | Maximum allowed (3)                 |

## Error Codes

| Status | Condition                                        |
| ------ | ------------------------------------------------ |
| 401    | Missing or invalid JWT                           |
| 403    | User is not the event organizer                  |
| 404    | Event not found                                  |
| 429    | All targets on cooldown (Retry-After header set) |

## What the Frontend Handles

- "Nudge" button next to participants without response
- "Nudge all" button for bulk action
- Displaying nudge count/remaining for each participant
- Disabled state when cooldown is active (with countdown timer)
- Confirmation toast after successful nudge
