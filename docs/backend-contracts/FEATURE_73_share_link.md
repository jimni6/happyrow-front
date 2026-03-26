# Backend Contract: Event share link and QR code (Issue #73)

## Context

Organizers need a way to invite participants without knowing their email. The backend issues a unique, shareable token per event (or per share link record). The frontend builds the public URL (for example `https://app.happyrow.com/join/{token}`) and generates a QR code from that URL client-side.

Authenticated users who open the app via the link (or scan the QR code) join the event as a participant with status `CONFIRMED`. A public, unauthenticated endpoint allows the app to show an event preview before sign-in.

**Authentication:** All endpoints except `GET /events/join/{token}` require a valid Bearer token (Supabase JWT) in the `Authorization` header: `Authorization: Bearer <jwt>`.

## Decisions

| Decision                               | Choice                                                                                                                                              |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token format                           | Opaque string, unique globally (stored in `event_share_links.token`); URL-safe (no ambiguous characters if possible)                                |
| Who can create/revoke/list share links | Event organizer (or creator); backend enforces ownership                                                                                            |
| Join behavior                          | `POST /events/join/{token}` adds current user as participant with `CONFIRMED`; idempotent if already participant (return success, no duplicate row) |
| Preview endpoint                       | Public, no auth; minimal fields only; no PII beyond organizer display name                                                                          |
| QR code                                | Generated entirely on the frontend from the share URL                                                                                               |

## What the frontend will provide

### Share URL and QR code

- The frontend constructs the full join URL: `https://app.happyrow.com/join/{token}` (or the configured app base URL + `/join/{token}`).
- The frontend renders the QR code from that URL; no backend endpoint for QR image generation.

### `POST /events/{eventId}/share`

No request body required, or optional body for future fields (for example `expiresAt`, `maxUses`). If the first version has no body, the backend applies defaults (see backend return / table).

### `POST /events/join/{token}`

No request body required. The participant identity is taken from the JWT (`sub` / user id). The frontend only navigates to the join flow and calls this endpoint after the user is authenticated.

### Headers (authenticated routes)

```
Authorization: Bearer <supabase_jwt>
```

## What the backend must return

### New persistence: `event_share_links`

| Column         | Type                | Notes                                                     |
| -------------- | ------------------- | --------------------------------------------------------- |
| `id`           | UUID (PK)           | Internal row id                                           |
| `event_id`     | UUID (FK)           | References event                                          |
| `token`        | string, unique      | Opaque share token                                        |
| `created_by`   | UUID                | User id of organizer who created the link                 |
| `expires_at`   | timestamp, nullable | Null means no expiry                                      |
| `is_active`    | boolean             | Soft revoke without deleting row                          |
| `max_uses`     | integer, nullable   | Null means unlimited                                      |
| `current_uses` | integer             | Increment on successful join via token (if tracking uses) |
| `created_at`   | timestamp           |                                                           |

API responses should use camelCase field names as in existing APIs (`eventId`, `expiresAt`, etc.).

### `POST /events/{eventId}/share` -- response (201 Created)

Returns the created share link (organizer only). Example:

```json
{
  "identifier": "uuid-share-link-row",
  "eventId": "uuid-event-123",
  "token": "opaque-url-safe-token",
  "createdBy": "uuid-user-organizer",
  "expiresAt": 1711986400000,
  "isActive": true,
  "maxUses": null,
  "currentUses": 0,
  "createdAt": 1711900000000
}
```

`expiresAt` may be `null` if not set. Timestamps as epoch milliseconds if the rest of the API uses that convention (match existing `Event` / `Participant` responses).

### `GET /events/{eventId}/share` -- response (200 OK)

Returns share links for the event that the caller is allowed to manage (typically all links for that event for the organizer). Example:

```json
[
  {
    "identifier": "uuid-share-link-row",
    "eventId": "uuid-event-123",
    "token": "opaque-url-safe-token",
    "createdBy": "uuid-user-organizer",
    "expiresAt": null,
    "isActive": true,
    "maxUses": 50,
    "currentUses": 12,
    "createdAt": 1711900000000
  }
]
```

### `DELETE /events/{eventId}/share/{tokenId}` -- response (204 No Content)

`tokenId` is the share link row identifier (`identifier` in API responses). Revokes the link (set `isActive` to false or delete row per backend policy). Returns 204 on success.

Errors: `403` if not organizer, `404` if event or share link not found.

### `GET /events/join/{token}` -- response (200 OK, public)

No `Authorization` header. Returns a preview of the event only:

```json
{
  "eventId": "uuid-event-123",
  "name": "Soirée BBQ",
  "eventDate": 1712000000000,
  "location": "Jardin",
  "type": "PARTY",
  "organizerName": "JeanD",
  "participantCount": 8
}
```

`organizerName` should follow the same resolution rules as `userName` / display name for participants (see display name contract). If the token is invalid, expired, inactive, or max uses exceeded, return `404` (or `410 Gone` for expired/revoked, if the API distinguishes).

### `POST /events/join/{token}` -- response (200 OK)

Requires Bearer token. On success, returns the created or existing participant in the same shape as `POST /events/{eventId}/participants` (including `userName`, `identifier`, `userId`, `eventId`, `status` `CONFIRMED`, timestamps).

If the user is already a participant for that event, return `200` with the current participant record (idempotent).

Errors: `401` if missing/invalid token; `404` if token invalid; `403` if token valid but join not allowed; `410` if link expired/revoked; `409` or `422` if business rules forbid join (document chosen status code consistently).

## API summary

| Endpoint                            | Method | Auth   | Description                                     |
| ----------------------------------- | ------ | ------ | ----------------------------------------------- |
| `/events/{eventId}/share`           | POST   | Bearer | Create a new share link (organizer only)        |
| `/events/{eventId}/share`           | GET    | Bearer | List share links for the event (organizer only) |
| `/events/{eventId}/share/{tokenId}` | DELETE | Bearer | Revoke a share link by share-link `identifier`  |
| `/events/join/{token}`              | GET    | None   | Public event preview from token                 |
| `/events/join/{token}`              | POST   | Bearer | Join event via token; participant `CONFIRMED`   |

Path parameters: `eventId`, `token`, `tokenId` (share link row id as returned in `identifier`).

## Field naming in API

| Field              | Type           | Context          | Description                                                                                                |
| ------------------ | -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `identifier`       | string (UUID)  | Share link rows  | Primary id of the share link record in responses                                                           |
| `token`            | string         | Share link       | Secret token embedded in the public URL                                                                    |
| `tokenId`          | string (UUID)  | DELETE path only | Same as share link `identifier`                                                                            |
| `eventId`          | string (UUID)  | All              | Event id                                                                                                   |
| `createdBy`        | string (UUID)  | Share link       | User id of creator                                                                                         |
| `expiresAt`        | number \| null | Share link       | Epoch ms or null                                                                                           |
| `isActive`         | boolean        | Share link       | Whether the link accepts new joins                                                                         |
| `maxUses`          | number \| null | Share link       | Cap on successful joins; null = unlimited                                                                  |
| `currentUses`      | number         | Share link       | Count of successful joins via this link (if implemented)                                                   |
| `createdAt`        | number         | Share link       | Epoch ms                                                                                                   |
| `name`             | string         | Preview          | Event name                                                                                                 |
| `eventDate`        | number         | Preview          | Event date (match `Event.eventDate` semantics)                                                             |
| `location`         | string         | Preview          | Event location                                                                                             |
| `type`             | string         | Preview          | `PARTY`, `BIRTHDAY`, `DINER`, `SNACK`, etc.                                                                |
| `organizerName`    | string \| null | Preview          | Resolved display name of organizer                                                                         |
| `participantCount` | number         | Preview          | Number of participants (definition: confirmed only vs all statuses -- backend should document chosen rule) |

Participant fields after join align with existing `Participant` model (`identifier`, `userId`, `userName`, `eventId`, `status`, `joinedAt`, `createdAt`, `updatedAt`).

## What the frontend handles on its side

- Building `https://app.happyrow.com/join/{token}` (or environment-specific base URL).
- QR code generation from that URL.
- Calling `GET /events/join/{token}` on the landing route for preview UI.
- After login, calling `POST /events/join/{token}` and syncing local event/participant state.
