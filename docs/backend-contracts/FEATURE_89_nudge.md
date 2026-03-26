# Backend Contract: Nudge / relance des invites

**Issue:** #89 — feat: systeme de nudge / relance des invites

## Context

The event organizer can send reminders (“nudges”) to guests who have not responded to the invitation or have not contributed, with cooldown and caps to limit spam.

**Auth:** `Authorization: Bearer <Supabase JWT>`

Only the **event organizer** may call nudge endpoints. The backend validates organizer role (or equivalent) for `eventId`.

Notifications (push and/or email) are sent asynchronously; the API records intent and returns which targets were nudged vs skipped.

## What the frontend will provide

### Send nudge(s)

`POST /events/{eventId}/nudge`

```json
{
  "targetUserIds": ["uuid1", "uuid2"],
  "type": "NO_RESPONSE"
}
```

Or nudge all eligible pending users:

```json
{
  "targetUserIds": "all_pending",
  "type": "NO_CONTRIBUTION"
}
```

- `type`: required — `NO_RESPONSE` | `NO_CONTRIBUTION`.
- `targetUserIds`: required — either a non-empty array of participant `userId` values, or the literal `"all_pending"`. Backend resolves `"all_pending"` to users matching the nudge type (e.g. no RSVP yet, or no contribution yet) **and** eligible under cooldown/max rules.

### Get nudge history

`GET /events/{eventId}/nudge/history`

- No body. Organizer only.

## What the backend must return

### `POST /events/{eventId}/nudge`

- **200** with per-target outcome:

```json
{
  "sent": [
    {
      "userId": "uuid1",
      "userName": "Marie",
      "type": "NO_RESPONSE",
      "sentAt": 1711900000000
    }
  ],
  "skipped": [
    {
      "userId": "uuid2",
      "userName": "Paul",
      "reason": "COOLDOWN_ACTIVE",
      "retryAfter": 1711950000000
    }
  ]
}
```

- `sent`: users for whom a nudge was recorded and notification dispatch was accepted (define whether failed notification still counts as sent; recommend: record row only after enqueue success).
- `skipped`: users not nudged; `reason` examples: `COOLDOWN_ACTIVE`, `MAX_NUDGES_REACHED`, `NOT_ORGANIZER` (should be 403 before this body), `INVALID_TARGET`, `NOT_PENDING`.

**Cooldown:** If the last nudge to the same user for the same `type` on this event was less than **24 hours** ago, do not send. Include that user in `skipped` with `reason: "COOLDOWN_ACTIVE"` and `retryAfter` (Unix ms) when a new nudge is allowed.

**HTTP 429:** When **every** target in the request is skipped due to `COOLDOWN_ACTIVE` (no row in `sent`), respond with **429 Too Many Requests** and a **`Retry-After`** header (seconds until the earliest eligible time, derived from the minimum `retryAfter` among skipped targets, or HTTP-date). When **at least one** target is in `sent`, respond **200** and list cooldown-blocked users under `skipped` with body `retryAfter` as above.

**Max nudges:** **3** nudges per user per event per `type`. Further attempts: `skipped` with `reason: "MAX_NUDGES_REACHED"` (no 429 required unless specified).

### `GET /events/{eventId}/nudge/history`

- **200** — organizer-only list:

```json
{
  "nudges": [
    {
      "identifier": "uuid",
      "targetUserId": "uuid1",
      "targetUserName": "Marie",
      "type": "NO_RESPONSE",
      "sentAt": 1711900000000,
      "nudgeCount": 2,
      "maxNudges": 3
    }
  ]
}
```

- Rows represent history aggregated or listed per logical nudge event; backend may return one row per send or aggregated per user/type — the example shows enriched summary. `nudgeCount` is how many times this user was nudged for this type (or on this event, per chosen aggregation); `maxNudges` is always `3`.

**403** if not organizer. **404** if event not found.

### Notification payload (push / data channel)

Backend (or notification worker) should deliver something equivalent to:

```json
{
  "title": "Rappel",
  "body": "Jean te rappelle de repondre a l'evenement BBQ du samedi",
  "data": {
    "type": "NUDGE",
    "eventId": "uuid",
    "url": "/events/uuid"
  }
}
```

- `body` should personalize organizer name and event title from stored data.

## Business rules (backend)

| Rule               | Detail                                                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organizer only     | Only organizer may `POST` nudge and `GET` history                                                                                                           |
| Cooldown           | 24 hours between nudges to the **same user** for the **same** `type` on the **same** event                                                                  |
| Max nudges         | 3 per user per event per `type`                                                                                                                             |
| Cooldown violation | Do not send; return in `skipped` with `COOLDOWN_ACTIVE` and `retryAfter`; use **429** + `Retry-After` header where the contract requires HTTP-level backoff |
| Delivery           | Send push notification and/or email to each nudged user                                                                                                     |

## Data model: `nudge_history`

| Column             | Type      | Notes                                                    |
| ------------------ | --------- | -------------------------------------------------------- |
| `id`               | UUID PK   |                                                          |
| `eventId`          | UUID FK   |                                                          |
| `senderId`         | UUID      | Organizer `userId`                                       |
| `targetUserId`     | UUID      | Invited participant                                      |
| `type`             | ENUM      | `NO_RESPONSE`, `NO_CONTRIBUTION`                         |
| `sentAt`           | timestamp |                                                          |
| `notificationSent` | boolean   | Whether notification was enqueued/delivered successfully |

Indexes recommended on `(eventId, targetUserId, type, sentAt)` for cooldown and counts.

## API summary

| Endpoint                          | Method | Auth                   | Description                                               |
| --------------------------------- | ------ | ---------------------- | --------------------------------------------------------- |
| `/events/{eventId}/nudge`         | POST   | Bearer JWT (organizer) | Send nudges; applies cooldown and max 3 per user per type |
| `/events/{eventId}/nudge/history` | GET    | Bearer JWT (organizer) | List nudge history for the event                          |

## Field naming

| Field              | Type                          | Description                                                                        |
| ------------------ | ----------------------------- | ---------------------------------------------------------------------------------- |
| `targetUserIds`    | `string[]` \| `"all_pending"` | Explicit ids or resolve all pending                                                |
| `type`             | string                        | `NO_RESPONSE` \| `NO_CONTRIBUTION`                                                 |
| `sent`             | array                         | Successfully nudged entries                                                        |
| `skipped`          | array                         | Not nudged; includes `reason`, optional `retryAfter` (ms epoch)                    |
| `retryAfter`       | number                        | Unix timestamp in ms when cooldown ends (body); header `Retry-After` per HTTP spec |
| `identifier`       | UUID                          | History row id                                                                     |
| `targetUserId`     | UUID                          | Nudged user                                                                        |
| `targetUserName`   | string                        | Display name                                                                       |
| `sentAt`           | number                        | Ms epoch, consistent with other APIs                                               |
| `nudgeCount`       | number                        | Count toward cap                                                                   |
| `maxNudges`        | number                        | Constant `3` in responses                                                          |
| `notificationSent` | boolean                       | DB column for pipeline tracking                                                    |

JSON uses **camelCase**. Enum values in uppercase strings to match existing `status`-style conventions.
