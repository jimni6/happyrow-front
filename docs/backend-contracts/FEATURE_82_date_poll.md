# Backend Contract: Date Poll (Doodle-like)

> Issue #82 — `feat: sondage de date (Doodle-like)`

## Context

The organizer proposes multiple dates, participants vote for their preferences. The best date is highlighted. This avoids relying on external tools like Doodle or Framadate.

Auth: Bearer JWT. Only event participants can view and vote. Only the organizer can create, close, or delete polls.

## Decisions

| Decision           | Choice                                               |
| ------------------ | ---------------------------------------------------- |
| Poll type          | DATE for now (extensible to LOCATION later)          |
| Vote model         | Multi-select (vote for multiple options)             |
| Vote replacement   | New vote replaces previous (no partial update)       |
| Close behavior     | Organizer closes poll and optionally sets event date |
| One poll per event | Yes for MVP (can be relaxed later)                   |

## Data Model

### Table `event_polls`

| Column    | Type        | Notes                        |
| --------- | ----------- | ---------------------------- |
| id        | UUID        | PK                           |
| eventId   | UUID        | FK to events, indexed        |
| type      | VARCHAR(10) | Default 'DATE'               |
| status    | VARCHAR(10) | 'OPEN' or 'CLOSED'           |
| createdBy | UUID        | FK to auth.users (organizer) |
| createdAt | TIMESTAMP   |                              |
| closedAt  | TIMESTAMP   | Nullable                     |

### Table `poll_options`

| Column    | Type         | Notes                  |
| --------- | ------------ | ---------------------- |
| id        | UUID         | PK                     |
| pollId    | UUID         | FK to event_polls      |
| label     | VARCHAR(100) | e.g. "Samedi 5 avril"  |
| dateStart | TIMESTAMP    | Start of proposed slot |
| dateEnd   | TIMESTAMP    | Nullable, end of slot  |
| sortOrder | INT          | Display order          |

### Table `poll_votes`

| Column    | Type      | Notes              |
| --------- | --------- | ------------------ |
| id        | UUID      | PK                 |
| optionId  | UUID      | FK to poll_options |
| userId    | UUID      | FK to auth.users   |
| createdAt | TIMESTAMP |                    |

Unique constraint on `(optionId, userId)`.

## What the Frontend Will Provide

### `POST /events/{eventId}/polls`

Create a poll (organizer only).

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
      "dateStart": "2026-04-06T12:00:00Z",
      "dateEnd": "2026-04-06T20:00:00Z"
    },
    {
      "label": "Samedi 12 avril",
      "dateStart": "2026-04-12T14:00:00Z",
      "dateEnd": null
    }
  ]
}
```

### `POST /events/{eventId}/polls/{pollId}/vote`

Cast votes. Replaces all previous votes for this user on this poll.

```json
{
  "optionIds": ["uuid-option-1", "uuid-option-3"]
}
```

### `DELETE /events/{eventId}/polls/{pollId}/vote`

Remove all votes for current user. No body.

### `PUT /events/{eventId}/polls/{pollId}/close`

Close the poll and optionally set event date (organizer only).

```json
{
  "selectedOptionId": "uuid-option-1"
}
```

If `selectedOptionId` is provided, the backend updates the event's `eventDate` to the selected option's `dateStart`.

## What the Backend Must Return

### `GET /events/{eventId}/polls` -- response

```json
[
  {
    "identifier": "uuid-poll",
    "eventId": "uuid-event",
    "type": "DATE",
    "status": "OPEN",
    "createdBy": "uuid-organizer",
    "createdAt": 1711900000000,
    "closedAt": null
  }
]
```

### `GET /events/{eventId}/polls/{pollId}` -- response

Full poll with options, vote counts, and voter details.

```json
{
  "identifier": "uuid-poll",
  "eventId": "uuid-event",
  "type": "DATE",
  "status": "OPEN",
  "createdBy": "uuid-organizer",
  "options": [
    {
      "identifier": "uuid-option-1",
      "label": "Samedi 5 avril",
      "dateStart": "2026-04-05T14:00:00Z",
      "dateEnd": "2026-04-05T22:00:00Z",
      "voteCount": 5,
      "voters": [
        { "userId": "uuid-1", "userName": "JeanD" },
        { "userId": "uuid-2", "userName": "Marie" },
        { "userId": "uuid-3", "userName": "Paul" },
        { "userId": "uuid-4", "userName": "Sophie" },
        { "userId": "uuid-5", "userName": "Ahmed" }
      ],
      "hasVoted": true
    },
    {
      "identifier": "uuid-option-2",
      "label": "Dimanche 6 avril",
      "dateStart": "2026-04-06T12:00:00Z",
      "dateEnd": "2026-04-06T20:00:00Z",
      "voteCount": 3,
      "voters": [
        { "userId": "uuid-1", "userName": "JeanD" },
        { "userId": "uuid-6", "userName": "Luc" },
        { "userId": "uuid-7", "userName": "Emma" }
      ],
      "hasVoted": true
    }
  ],
  "totalVoters": 8,
  "createdAt": 1711900000000,
  "closedAt": null
}
```

`hasVoted` is relative to the current authenticated user. `totalVoters` is the count of distinct users who voted on any option.

### `POST /events/{eventId}/polls/{pollId}/vote` -- response

Returns the updated poll (same shape as GET detail).

### `PUT /events/{eventId}/polls/{pollId}/close` -- response

Returns the updated poll with `status: "CLOSED"` and `closedAt` set.

If `selectedOptionId` was provided, the event's `eventDate` is also updated (side effect). The response includes a confirmation:

```json
{
  "poll": { ... },
  "eventDateUpdated": true,
  "newEventDate": "2026-04-05T14:00:00Z"
}
```

### `DELETE /events/{eventId}/polls/{pollId}` -- response

```
204 No Content
```

Deletes poll, options, and all votes. Organizer only.

## API Summary

| Endpoint                                 | Method | Auth               | Description          |
| ---------------------------------------- | ------ | ------------------ | -------------------- |
| `/events/{eventId}/polls`                | GET    | Bearer             | List polls for event |
| `/events/{eventId}/polls`                | POST   | Bearer (organizer) | Create poll          |
| `/events/{eventId}/polls/{pollId}`       | GET    | Bearer             | Get poll with votes  |
| `/events/{eventId}/polls/{pollId}`       | DELETE | Bearer (organizer) | Delete poll          |
| `/events/{eventId}/polls/{pollId}/vote`  | POST   | Bearer             | Cast votes           |
| `/events/{eventId}/polls/{pollId}/vote`  | DELETE | Bearer             | Remove votes         |
| `/events/{eventId}/polls/{pollId}/close` | PUT    | Bearer (organizer) | Close poll, set date |

## Field Naming

| Field            | Type           | Description                         |
| ---------------- | -------------- | ----------------------------------- |
| identifier       | string         | Poll or option UUID                 |
| type             | string         | "DATE"                              |
| status           | string         | "OPEN" or "CLOSED"                  |
| options          | object[]       | Poll options                        |
| label            | string         | Human-readable option label         |
| dateStart        | string         | ISO timestamp                       |
| dateEnd          | string or null | ISO timestamp                       |
| voteCount        | number         | Votes for this option               |
| voters           | object[]       | { userId, userName }                |
| hasVoted         | boolean        | Current user voted for this option  |
| totalVoters      | number         | Distinct voters across all options  |
| optionIds        | string[]       | Request: option UUIDs to vote for   |
| selectedOptionId | string         | Request: chosen option when closing |

## Error Codes

| Status | Condition                                                        |
| ------ | ---------------------------------------------------------------- |
| 400    | Empty options list, invalid dates                                |
| 401    | Missing or invalid JWT                                           |
| 403    | User not participant, or not organizer (for create/close/delete) |
| 404    | Event, poll, or option not found                                 |
| 409    | Poll already exists for this event (MVP: one poll per event)     |
| 410    | Poll is already closed (for vote/close)                          |

## What the Frontend Handles

- Poll creation form (date picker for each option)
- Voting UI (checkbox per option, submit button)
- Results visualization (bar chart or vote count per option)
- Highlighting the winning option
- Close poll action for organizer
- Confirmation dialog before setting event date
