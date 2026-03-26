# Backend Contract: Date poll (Doodle-like)

## Context

Issue #82: feat: sondage de date (Doodle-like).

The organizer proposes multiple date (or time-range) options for an event; participants vote for their preferences; the UI highlights the best option (typically by vote count). The frontend will create polls, list them, fetch poll detail with aggregates, submit and replace votes, close a poll with an optional winning option, and delete polls.

**Authorization:** All endpoints require `Authorization: Bearer <Supabase JWT>`. The backend must enforce that only the event **organizer** (or `creator`) can create, close, or delete polls, and that only **event participants** can view polls and vote (align with existing event access rules).

Existing event patterns: `GET/POST /events`, `GET/PUT/DELETE /events/{id}`, `GET/POST /events/{eventId}/participants`. An event has `identifier`, `name`, `description`, `eventDate`, `location`, `type`, `creator`.

## What the frontend will provide

### Create poll — `POST /events/{eventId}/polls`

Body:

```json
{
  "type": "DATE",
  "options": [
    {
      "label": "Samedi 5 avril",
      "dateStart": "2026-04-05T14:00:00Z",
      "dateEnd": "2026-04-05T22:00:00Z"
    },
    {
      "label": "Dimanche 6 avril",
      "dateStart": "2026-04-06T10:00:00Z",
      "dateEnd": null
    }
  ]
}
```

- `type` is `"DATE"` for this feature (default on the server may be `DATE` if omitted).
- `options` is ordered; `sortOrder` on the server should follow array order (0-based or 1-based, documented by backend).
- `dateEnd` may be `null` for a single instant or open-ended slot, depending on product rules.

### Cast votes — `POST /events/{eventId}/polls/{pollId}/vote`

Body:

```json
{
  "optionIds": ["uuid1", "uuid2"]
}
```

This **replaces** all previous votes for the current user on that poll (not additive). An empty array means "clear all votes" if the backend allows it, or **400** if at least one option is required (product decision).

### Close poll — `PUT /events/{eventId}/polls/{pollId}/close`

Body:

```json
{
  "selectedOptionId": "uuid"
}
```

`selectedOptionId` may be required or optional: if provided, the poll closes and the event's `eventDate` is updated to the selected option's `dateStart`. If omitted, the poll may close without changing the event (backend should define behavior).

### Path parameters

- `eventId` and `pollId` (and `optionIds` in the body) are UUIDs matching existing API conventions (`identifier` in responses).

## What the backend must return

### Data model (persistence)

**Table `event_polls`**

| Column      | Type            | Notes                            |
| ----------- | --------------- | -------------------------------- |
| `id`        | UUID (PK)       |                                  |
| `eventId`   | UUID (FK)       | References event                 |
| `type`      | VARCHAR         | Default `'DATE'`                 |
| `status`    | ENUM            | `'OPEN'`, `'CLOSED'`             |
| `createdBy` | UUID            | Organizer user id                |
| `createdAt` | TIMESTAMP       |                                  |
| `closedAt`  | TIMESTAMP, NULL | Set when status becomes `CLOSED` |

**Table `poll_options`**

| Column      | Type            | Notes                |
| ----------- | --------------- | -------------------- |
| `id`        | UUID (PK)       |                      |
| `pollId`    | UUID (FK)       |                      |
| `label`     | TEXT            | Human-readable label |
| `dateStart` | TIMESTAMP       |                      |
| `dateEnd`   | TIMESTAMP, NULL |                      |
| `sortOrder` | INT             | Display order        |

**Table `poll_votes`**

| Column      | Type      | Notes |
| ----------- | --------- | ----- |
| `id`        | UUID (PK) |       |
| `optionId`  | UUID (FK) |       |
| `userId`    | UUID      |       |
| `createdAt` | TIMESTAMP |       |

Constraint: **UNIQUE(`optionId`, `userId`)** so one vote per user per option; replacing votes is implemented by deleting existing rows for that `userId` and `pollId` then inserting the new set, or equivalent transactional logic.

### Side effect when closing with `selectedOptionId`

When `PUT .../close` includes `selectedOptionId` that belongs to the poll:

1. Set poll `status` to `CLOSED` and `closedAt` to now.
2. Update the parent event's `eventDate` to the **selected option's `dateStart`** (ISO instant stored consistently with `GET /events/{id}`).

### `POST /events/{eventId}/polls`

**201 Created** with the created poll resource including `identifier`, `eventId`, `type`, `status` (`OPEN`), `createdBy`, `createdAt`, and embedded or linked `options` with `identifier`, `label`, `dateStart`, `dateEnd`, `sortOrder`.

**403 Forbidden** if caller is not the organizer. **404** if event not found or not visible.

### `GET /events/{eventId}/polls`

**200 OK** with an array of poll summaries (each includes at least `identifier`, `eventId`, `type`, `status`, `createdAt`; options may be omitted or summarized for list view).

### `GET /events/{eventId}/polls/{pollId}`

**200 OK** — full detail for one poll. Example shape:

```json
{
  "identifier": "uuid",
  "eventId": "uuid",
  "type": "DATE",
  "status": "OPEN",
  "createdBy": "uuid",
  "options": [
    {
      "identifier": "uuid",
      "label": "Samedi 5 avril",
      "dateStart": "2026-04-05T14:00:00Z",
      "dateEnd": "2026-04-05T22:00:00Z",
      "voteCount": 5,
      "voters": ["uuid1", "uuid2", "uuid3", "uuid4", "uuid5"],
      "hasVoted": true
    }
  ],
  "totalVoters": 8,
  "createdAt": 1711900000000
}
```

- `voteCount` is the number of votes for that option.
- `voters` is the list of `userId` values who voted for that option (order undefined unless specified).
- `hasVoted` is **per option**: `true` if the authenticated user voted for that option.
- `totalVoters` is the count of **distinct users** who voted on at least one option in this poll.
- `createdAt` uses the same epoch-milliseconds convention as participant `joinedAt` in existing contracts.

**404** if poll or event missing. **403** if user cannot access the event.

### `POST /events/{eventId}/polls/{pollId}/vote`

**200 OK** or **204 No Content** after votes stored. Optionally return updated poll detail as `GET` (product choice).

**400** if any `optionId` does not belong to the poll. **403** if not a participant.

### `DELETE /events/{eventId}/polls/{pollId}/vote`

**204 No Content** after removing all votes for the current user on that poll.

**403** if not a participant.

### `PUT /events/{eventId}/polls/{pollId}/close`

**200 OK** with closed poll representation (status `CLOSED`, `closedAt` set). Event `eventDate` updated when `selectedOptionId` is provided as specified above.

**403** if not organizer.

### `DELETE /events/{eventId}/polls/{pollId}`

**204 No Content** on success. **403** if not organizer. **404** if not found.

Deleting a poll should delete dependent `poll_options` and `poll_votes` (cascade or explicit).

## API summary

| Endpoint                                 | Method | Description                                                       |
| ---------------------------------------- | ------ | ----------------------------------------------------------------- |
| `/events/{eventId}/polls`                | POST   | Create poll (organizer only)                                      |
| `/events/{eventId}/polls`                | GET    | List polls for the event                                          |
| `/events/{eventId}/polls/{pollId}`       | GET    | Poll detail with options, counts, and current user's vote flags   |
| `/events/{eventId}/polls/{pollId}/vote`  | POST   | Replace current user's votes with `optionIds`                     |
| `/events/{eventId}/polls/{pollId}/vote`  | DELETE | Remove all votes for current user on this poll                    |
| `/events/{eventId}/polls/{pollId}/close` | PUT    | Close poll; optional `selectedOptionId` updates event `eventDate` |
| `/events/{eventId}/polls/{pollId}`       | DELETE | Delete poll (organizer only)                                      |

## Field naming

| Field                 | Type                      | Location        | Description                                                                                                                                                            |
| --------------------- | ------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `identifier`          | UUID string               | Response        | Poll or option id (API id field; mirrors `id` in DB)                                                                                                                   |
| `eventId`             | UUID string               | Path / Response | Parent event                                                                                                                                                           |
| `pollId`              | UUID string               | Path            | Poll id                                                                                                                                                                |
| `type`                | `string`                  | Body / Response | Poll type; `"DATE"` for this feature                                                                                                                                   |
| `status`              | `string`                  | Response        | `OPEN` or `CLOSED`                                                                                                                                                     |
| `createdBy`           | UUID string               | Response        | User id of organizer who created the poll                                                                                                                              |
| `createdAt`           | `number` (epoch ms)       | Response        | Creation time                                                                                                                                                          |
| `closedAt`            | `number` or ISO string    | Response        | When closed; `null` if open (backend should pick one convention; prefer epoch ms for consistency with `createdAt` in the example or document ISO for date fields only) |
| `options`             | `array`                   | Body / Response | Poll options                                                                                                                                                           |
| `options[].label`     | `string`                  | Body / Response | Display label                                                                                                                                                          |
| `options[].dateStart` | ISO 8601 string           | Body / Response | Range start                                                                                                                                                            |
| `options[].dateEnd`   | ISO 8601 string or `null` | Body / Response | Range end                                                                                                                                                              |
| `options[].sortOrder` | `number`                  | Response        | Display order                                                                                                                                                          |
| `options[].voteCount` | `number`                  | Response        | Votes for this option                                                                                                                                                  |
| `options[].voters`    | `string[]` (UUID)         | Response        | User ids who voted this option                                                                                                                                         |
| `options[].hasVoted`  | `boolean`                 | Response        | Whether current user voted this option                                                                                                                                 |
| `totalVoters`         | `number`                  | Response        | Distinct voters in the poll                                                                                                                                            |
| `optionIds`           | `string[]` (UUID)         | Request body    | Options the user selects (replaces prior votes)                                                                                                                        |
| `selectedOptionId`    | UUID string               | Request body    | Winning option when closing; drives `eventDate` update                                                                                                                 |

Use **camelCase** in JSON. For timestamp fields, align with the rest of the app: if `eventDate` in events is ISO strings, keep `dateStart` / `dateEnd` as ISO strings; use epoch milliseconds for `createdAt` where the frontend already expects numeric timestamps on participants.
