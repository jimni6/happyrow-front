# Backend Contract: Guest access (invitation sans compte)

**Issue:** #85 — feat: invitation sans compte (guest access)

## Context

A guest can view an event and contribute without creating a full account, then convert to a full account later. This feature depends on issue #73 (share link): joining as a guest is triggered via a share token.

Authenticated users continue to use a Supabase JWT in the `Authorization` header (`Bearer <token>`). Guest sessions use a separate, limited-scope guest JWT, also sent as `Authorization: Bearer <guestJwt>` unless otherwise noted below.

**Auth (standard users):** `Authorization: Bearer <Supabase JWT>`

**Auth (guests):** `Authorization: Bearer <guest JWT>` — scoped to a single `eventId`; must not grant access to other events or organizer-only actions.

Guests cannot create events, access other events, or manage other participants. Read access for event details, resources, and participants is allowed when the guest JWT matches the requested `eventId`.

## What the frontend will provide

### Join as guest

`POST /events/join/{token}/guest`

- Path: `token` — share token from issue #73 (opaque string tied to an event).
- Headers: none required for this step (no Supabase session yet).
- Body:

```json
{
  "guestName": "Marie"
}
```

- `guestName` is required, non-empty string (trimmed). Backend validates length and character policy as needed.

### Guest contributions

`POST /events/{eventId}/resources/{resourceId}/contributions`

- Headers: `Authorization: Bearer <guest JWT>`.
- Body: same contribution shape as for authenticated users; backend attributes the contribution to the guest (`guestId` stored as acting user identifier per existing contribution model).

### Guest participant status

`PUT /events/{eventId}/participants/{guestId}`

- Headers: `Authorization: Bearer <guest JWT>`.
- Path `guestId` must match the guest’s own participant / guest identifier (backend rejects updates for other participants).
- Body: at minimum `status` — one of `INVITED`, `CONFIRMED`, `MAYBE`, `DECLINED` (same enum as full participants). Backend restricts which transitions are valid for guests if needed.

### Convert guest to full account

`POST /auth/convert-guest`

- Headers: optional `Authorization` not required if `guestToken` is in body; alternatively backend may accept only body token for consistency with “no account yet.”
- Body:

```json
{
  "email": "marie@example.com",
  "password": "<secret>",
  "firstname": "Marie",
  "lastname": "Dupont",
  "guestToken": "<guest JWT string>"
}
```

- Frontend obtains `guestToken` from the guest session (same value as used in `Authorization` for guest calls).

## What the backend must return

### `POST /events/join/{token}/guest`

- **201 Created** on success.
- Body includes the guest session token and metadata the frontend needs for subsequent calls:

```json
{
  "guestToken": "<JWT>",
  "guestId": "uuid",
  "eventId": "uuid",
  "expiresAt": 1712504400000
}
```

- Backend must:
  - Resolve `token` to a valid share / event.
  - Create a `guest_sessions` row and a participant with `status` **CONFIRMED**, linking the generated `guestId` to the event.
  - Issue a guest JWT whose payload matches the agreed shape (see below).

**Error responses (examples):** `404` invalid or expired share token; `400` invalid `guestName`; `409` if business rules forbid duplicate guest join (define as needed).

### Guest JWT payload

```json
{
  "sub": "guest_uuid",
  "role": "guest",
  "eventId": "uuid",
  "guestName": "Marie",
  "exp": 1712504400
}
```

- `sub` is the stable guest / participant identifier used as `guestId` in paths and for attributing contributions.
- Token must be rejected for any `eventId` other than the one in the payload.

### `GET /events/{eventId}` (guest)

- With `Authorization: Bearer <guest JWT>` where `eventId` matches the token: return event details, resources, and participants in the same shapes as for authenticated participants, **read-only** (no mutations that guests are not allowed to perform via other endpoints).
- **403** if guest JWT is for another event; **401** if token missing or invalid/expired.

### `POST /events/{eventId}/resources/{resourceId}/contributions` (guest)

- **201** with the created contribution object; `userId` (or equivalent actor field) reflects `guestId` until conversion.
- **403** if `eventId` does not match guest scope.

### `PUT /events/{eventId}/participants/{guestId}` (guest)

- **200** with updated participant object (including `identifier`, `userId` / guest identifier, `userName` / display name for guest, `eventId`, `status`).
- **403** if the guest attempts to update another participant.

### `POST /auth/convert-guest`

- **201** or **200** on success; body should include Supabase session tokens or whatever the frontend needs to sign in (align with existing auth responses in the app).
- Backend must, atomically or with compensating transactions:
  1. Create the user in Supabase Auth (`email`, `password`, metadata for `firstname`, `lastname`).
  2. Update **all** participant rows that referenced `guestId` to the new `userId`.
  3. Update **all** contribution rows that referenced `guestId` as actor to the new `userId`.
  4. Invalidate the guest session (delete or revoke `guest_sessions` row; guest JWT must no longer be accepted).

**Error responses:** `400` validation; `401` invalid/expired `guestToken`; `409` email already registered.

## Data model: `guest_sessions`

| Column       | Type        | Notes                                                   |
| ------------ | ----------- | ------------------------------------------------------- |
| `id`         | UUID / PK   | Session row id                                          |
| `guestId`    | UUID        | Stable guest id; matches JWT `sub` and participant link |
| `guestName`  | string      | Display name at join time                               |
| `shareToken` | string / FK | Ties session to share link (issue #73)                  |
| `eventId`    | UUID        | FK to event                                             |
| `createdAt`  | timestamp   |                                                         |
| `expiresAt`  | timestamp   | Default **7 days** from `createdAt`                     |

Guest JWT `exp` must align with `expiresAt`.

## API summary

| Endpoint                                                 | Method | Auth                                 | Description                                                                                |
| -------------------------------------------------------- | ------ | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `/events/join/{token}/guest`                             | POST   | None                                 | Join as guest; returns `guestToken` and creates participant `CONFIRMED` + `guest_sessions` |
| `/events/{eventId}`                                      | GET    | Bearer Supabase JWT **or** guest JWT | Guest: read-only for matching `eventId` only                                               |
| `/events/{eventId}/resources/{resourceId}/contributions` | POST   | Bearer Supabase JWT **or** guest JWT | Guest: contribute with `guestId` as actor                                                  |
| `/events/{eventId}/participants/{guestId}`               | PUT    | Bearer guest JWT                     | Guest updates own `status` only                                                            |
| `/auth/convert-guest`                                    | POST   | Body `guestToken`                    | Create account; migrate participants + contributions; invalidate guest session             |

Existing patterns remain: `GET/POST /events`, `GET/PUT/DELETE /events/{id}`, `GET/POST /events/{eventId}/participants` for full users; guest-specific rules override only where stated.

## Field naming

| Field                                        | Location                    | Type         | Description                             |
| -------------------------------------------- | --------------------------- | ------------ | --------------------------------------- |
| `guestName`                                  | Join body                   | string       | Display name for the guest              |
| `guestToken`                                 | Convert body, join response | string (JWT) | Limited-scope guest token               |
| `guestId`                                    | Paths, responses            | UUID         | Stable id for guest before conversion   |
| `guest_sessions`                             | DB table                    | —            | Persistence for guest session lifecycle |
| `email`, `password`, `firstname`, `lastname` | Convert body                | strings      | New account credentials and profile     |

API JSON uses **camelCase** for request/response fields (`guestName`, `guestId`, `eventId`, `shareToken` in internal models as needed). Participant `status` values: `INVITED`, `CONFIRMED`, `MAYBE`, `DECLINED` (uppercase strings, consistent with existing API).
