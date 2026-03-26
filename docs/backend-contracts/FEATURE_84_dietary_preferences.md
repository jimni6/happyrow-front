# Backend Contract: Dietary Preferences Visible on Event

> Issue #84 — `feat: preferences alimentaires visibles sur l'evenement`
>
> Depends on: Issue #77 (user profile with `dietaryPreferences` in `user_profiles`)

## Context

Display participants' dietary preferences (allergies, vegan, halal, vegetarian...) on the event page so the organizer can adapt resources. The preferences are stored per-user in the profile (#77) and need to be aggregated per-event.

Auth: Bearer JWT.

## Decisions

| Decision           | Choice                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Data source        | `user_profiles.dietaryPreferences` (JSONB array)                  |
| Participant filter | CONFIRMED and MAYBE statuses only                                 |
| Delivery method    | Both: aggregated summary endpoint + enriched participant response |
| Empty preferences  | Users without preferences are excluded from summary               |

## Standard Preference Values

`vegetarian`, `vegan`, `gluten-free`, `lactose-free`, `halal`, `kosher`, `nut-allergy`, `shellfish-allergy`, `other`

## What the Frontend Will Provide

No new request body. The frontend calls the new endpoint and reads enriched participant data.

## What the Backend Must Return

### `GET /events/{eventId}/dietary-summary` -- response (new endpoint)

Aggregated dietary preferences for all CONFIRMED/MAYBE participants.

```json
{
  "eventId": "uuid",
  "participantCount": 8,
  "summary": [
    {
      "preference": "vegetarian",
      "count": 2,
      "participants": [
        { "userId": "uuid-1", "userName": "Marie" },
        { "userId": "uuid-2", "userName": "Sophie" }
      ]
    },
    {
      "preference": "gluten-free",
      "count": 1,
      "participants": [{ "userId": "uuid-1", "userName": "Marie" }]
    },
    {
      "preference": "halal",
      "count": 1,
      "participants": [{ "userId": "uuid-3", "userName": "Ahmed" }]
    }
  ]
}
```

If no participants have dietary preferences, return `{ "eventId": "uuid", "participantCount": 8, "summary": [] }`.

### `GET /events/{eventId}/participants` -- response (enriched, existing endpoint)

Add `dietaryPreferences` to each participant:

```json
[
  {
    "identifier": "uuid",
    "userId": "uuid-1",
    "userName": "Marie",
    "status": "CONFIRMED",
    "dietaryPreferences": ["vegetarian", "gluten-free"],
    "joinedAt": 1711900000000,
    "createdAt": 1711900000000,
    "updatedAt": null
  },
  {
    "identifier": "uuid",
    "userId": "uuid-4",
    "userName": "Paul",
    "status": "CONFIRMED",
    "dietaryPreferences": [],
    "joinedAt": 1711900000000,
    "createdAt": 1711900000000,
    "updatedAt": null
  }
]
```

The backend joins `participants` with `user_profiles` to resolve `dietaryPreferences`. Empty array for users without preferences set.

## API Summary

| Endpoint                            | Method | Auth   | Change                                             |
| ----------------------------------- | ------ | ------ | -------------------------------------------------- |
| `/events/{eventId}/dietary-summary` | GET    | Bearer | New: aggregated dietary summary                    |
| `/events/{eventId}/participants`    | GET    | Bearer | Enriched: add `dietaryPreferences` per participant |

## Field Naming

| Field                  | Type     | Description                                 |
| ---------------------- | -------- | ------------------------------------------- |
| participantCount       | number   | Total participants (CONFIRMED + MAYBE)      |
| summary                | object[] | Aggregated preferences                      |
| summary[].preference   | string   | Preference name                             |
| summary[].count        | number   | Number of participants with this preference |
| summary[].participants | object[] | { userId, userName }                        |
| dietaryPreferences     | string[] | Per-participant preference list             |

## Backend Implementation Notes

- Join `participants` (status IN ('CONFIRMED', 'MAYBE')) with `user_profiles` on userId
- Unnest the JSONB array and aggregate by preference value
- The enriched participant endpoint adds a LEFT JOIN to user_profiles
- Participants without a user_profiles row get `dietaryPreferences: []`

## What the Frontend Handles

- Dietary summary badges on event page (icon + count per preference)
- Expandable detail: which participants have which preferences
- Per-participant dietary badges in participant list
- Color-coded preference tags
