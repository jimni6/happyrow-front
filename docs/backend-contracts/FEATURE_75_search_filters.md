# Backend Contract: Search and Filters on Events

> Issue #75 — `feat: recherche et filtres sur les evenements`

## Context

The current `GET /events` endpoint returns all events for the authenticated user without filtering or search. As users accumulate events, they need to search by name and filter by type, date range, and participation status.

Auth: Bearer JWT.

## Current Behavior

`GET /events` returns all events. The frontend currently receives the full list and the organizer ID is used client-side.

## Proposed Changes

Add query parameters to `GET /events` for server-side filtering.

## What the Frontend Will Provide

### `GET /events` -- query parameters

| Parameter   | Type       | Example                          | Description                                           |
| ----------- | ---------- | -------------------------------- | ----------------------------------------------------- |
| `search`    | string     | `?search=bbq`                    | Case-insensitive partial match on event name          |
| `type`      | string     | `?type=PARTY`                    | Filter by EventType. Multiple: `?type=PARTY,BIRTHDAY` |
| `dateFrom`  | ISO string | `?dateFrom=2026-04-01T00:00:00Z` | Events on or after this date                          |
| `dateTo`    | ISO string | `?dateTo=2026-04-30T23:59:59Z`   | Events on or before this date                         |
| `status`    | string     | `?status=CONFIRMED`              | Filter by user's participation status                 |
| `timeframe` | string     | `?timeframe=upcoming`            | Shorthand: `upcoming` (future events) or `past`       |
| `sortBy`    | string     | `?sortBy=date`                   | Sort field: `date` (default), `name`, `created`       |
| `sortOrder` | string     | `?sortOrder=asc`                 | `asc` or `desc` (default: `asc` for date)             |
| `limit`     | number     | `?limit=20`                      | Page size (default 20, max 100)                       |
| `offset`    | number     | `?offset=0`                      | Pagination offset                                     |

All parameters are optional. When omitted, current behavior is preserved (return all events).

Parameters are combinable: `?search=bbq&type=PARTY&timeframe=upcoming`

## What the Backend Must Return

### `GET /events` -- response (enhanced)

```json
{
  "events": [
    {
      "identifier": "uuid",
      "name": "BBQ du samedi",
      "description": "Un BBQ entre amis",
      "eventDate": "2026-04-05T14:00:00Z",
      "location": "Parc de la Tete d'Or",
      "type": "PARTY",
      "creator": "uuid-organizer",
      "participantStatus": "CONFIRMED",
      "participantCount": 8
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

New fields in each event object:

- `participantStatus`: the current user's participation status for this event (for filtering/display)
- `participantCount`: number of participants (for sorting/display)

Pagination metadata: `total` (total matching results), `limit`, `offset`.

When no query parameters are provided, the response wraps existing data in this format for backward compatibility. The frontend already handles both `[]` (array) and `{ events: [] }` (object) response formats.

## API Summary

| Endpoint  | Method | Auth   | Change                                                    |
| --------- | ------ | ------ | --------------------------------------------------------- |
| `/events` | GET    | Bearer | Add query parameters for search, filter, sort, pagination |

## Field Naming

| Field             | Type   | Description                                    |
| ----------------- | ------ | ---------------------------------------------- |
| search            | string | Query param: partial name match                |
| type              | string | Query param: comma-separated EventTypes        |
| dateFrom          | string | Query param: ISO date lower bound              |
| dateTo            | string | Query param: ISO date upper bound              |
| timeframe         | string | Query param: "upcoming" or "past"              |
| status            | string | Query param: participation status filter       |
| participantStatus | string | Response: current user's status for this event |
| participantCount  | number | Response: total participant count              |
| total             | number | Response: total matching results               |

## Backend Implementation Notes

- `search` should use `ILIKE '%{search}%'` on event name (or full-text search if available)
- `status` filter requires joining with participants table where userId = current user
- `timeframe=upcoming` is equivalent to `dateFrom=now()`
- `timeframe=past` is equivalent to `dateTo=now()`
- If both `timeframe` and explicit date params are provided, explicit params take precedence

## What the Frontend Handles

- Search input with debounce (300ms)
- Filter UI (dropdowns/chips for type, date range picker, status tabs)
- Combining filters and updating query params
- Displaying result count
- Empty state when no results match
- Progressive migration: frontend can still filter client-side as fallback
