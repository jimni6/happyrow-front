# Backend Contract: Dietary preferences visible on the event (Issue #84)

## Context

Organizers need to see participants' dietary preferences (allergies, vegan, halal, vegetarian, and similar) on the event page so they can adapt food, venues, and resources. This feature depends on issue #77: user profile data stores dietary preferences in `user_profiles.dietary_preferences` as a JSONB array of string values.

**Authentication:** All endpoints described here require a valid Bearer token (Supabase JWT) in the `Authorization` header: `Authorization: Bearer <jwt>`.

## Decisions

| Decision                      | Choice                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Participant statuses included | `CONFIRMED` and `MAYBE` only (exclude declined or pending as product defines)                                                                |
| Who sees dietary data         | Same rules as viewing the event participant list (organizer and participants per existing product policy; backend must enforce consistently) |
| Summary content               | Only preferences that at least one included participant has set; empty `summary` array if no participant has preferences                     |
| Dual delivery                 | Provide both the aggregation endpoint and per-participant `dietaryPreferences` on the participants payload (recommended)                     |

## What the frontend will provide

### Headers (all routes)

```
Authorization: Bearer <supabase_jwt>
```

### `GET /events/{eventId}/dietary-summary`

No request body. Path parameter: `eventId` (event UUID).

### `GET /events/{eventId}/participants`

No change to how the frontend calls the endpoint; the backend enriches each participant object with `dietaryPreferences` when present.

## What the backend must return

### Data model (profile, issue #77)

Preferences are read from `user_profiles.dietary_preferences` (JSONB array of strings). The API exposes this field as `dietaryPreferences` (camelCase) on enriched participant objects.

### Aggregation query (conceptual)

Join `participants` (filtered by `event_id` and `status IN ('CONFIRMED', 'MAYBE')`) with `user_profiles` on the participant's user id. For each user, expand each entry in `dietary_preferences` into contribution rows, then group by preference value to produce counts and participant lists. Users with null or empty `dietary_preferences` do not contribute any row to `summary`.

### Suggested canonical preference values (enum)

The backend may validate stored values against a shared enum with the frontend. Suggested values:

`vegetarian`, `vegan`, `gluten-free`, `lactose-free`, `halal`, `kosher`, `nut-allergy`, `shellfish-allergy`, `other`

Unknown or legacy strings may still appear in data; the API should return them as stored rather than dropping them, unless a migration normalizes them.

### `GET /events/{eventId}/dietary-summary` -- response (200 OK)

```json
{
  "eventId": "uuid",
  "participantCount": 8,
  "summary": [
    {
      "preference": "vegetarian",
      "count": 2,
      "participants": [
        { "userId": "uuid1", "userName": "Marie" },
        { "userId": "uuid2", "userName": "Sophie" }
      ]
    },
    {
      "preference": "gluten-free",
      "count": 1,
      "participants": [{ "userId": "uuid1", "userName": "Marie" }]
    },
    {
      "preference": "halal",
      "count": 1,
      "participants": [{ "userId": "uuid3", "userName": "Ahmed" }]
    }
  ]
}
```

- `participantCount`: number of participants included in the aggregation (same status filter as above).
- `summary`: one object per distinct preference string that appears on at least one included participant; `participants` lists each user who has that preference (a user with multiple preferences appears under multiple summary entries).

Errors: `401` if missing or invalid token; `403` if the caller cannot access the event; `404` if the event does not exist.

### `GET /events/{eventId}/participants` -- enriched participant shape

Each participant in the list includes `dietaryPreferences` when the profile has data; otherwise omit the field or return an empty array per API consistency rules (prefer one convention and document it).

```json
{
  "identifier": "uuid",
  "userId": "uuid",
  "userName": "Marie",
  "status": "CONFIRMED",
  "dietaryPreferences": ["vegetarian", "gluten-free"],
  "joinedAt": 1711900000000
}
```

Field names and timestamp format must match existing `Participant` responses elsewhere in the API (`identifier`, `userId`, `userName`, `status`, `joinedAt`, etc.).

## API summary

| Endpoint                            | Method | Auth   | Description                                                                    |
| ----------------------------------- | ------ | ------ | ------------------------------------------------------------------------------ |
| `/events/{eventId}/dietary-summary` | GET    | Bearer | Aggregated dietary preferences for confirmed and maybe participants            |
| `/events/{eventId}/participants`    | GET    | Bearer | Existing list; each item may include `dietaryPreferences` from `user_profiles` |

Path parameter: `eventId` (event UUID).

## Field naming in API

| Field                | Type          | Context               | Description                                                      |
| -------------------- | ------------- | --------------------- | ---------------------------------------------------------------- |
| `eventId`            | string (UUID) | Summary root          | Event id                                                         |
| `participantCount`   | number        | Summary               | Count of participants in the aggregation set                     |
| `summary`            | array         | Summary               | One entry per preference value with counts and participant refs  |
| `preference`         | string        | Summary item          | Single dietary preference key (see suggested enum)               |
| `count`              | number        | Summary item          | Number of participants who have this preference                  |
| `participants`       | array         | Summary item          | `{ userId, userName }` for each participant with this preference |
| `userId`             | string (UUID) | Summary / participant | User id                                                          |
| `userName`           | string        | Summary / participant | Display name (same resolution as elsewhere)                      |
| `dietaryPreferences` | string[]      | Participant           | Values from profile JSONB; camelCase in JSON                     |
| `identifier`         | string (UUID) | Participant           | Participant row id                                               |
| `status`             | string        | Participant           | e.g. `CONFIRMED`, `MAYBE`                                        |
| `joinedAt`           | number        | Participant           | Epoch ms if that is the project convention                       |

Database column `dietary_preferences` maps to API `dietaryPreferences`.
