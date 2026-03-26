# Backend Contract: Event Share Link + QR Code

> Issue #73 — `feat: lien de partage d'evenement + QR code`

## Context

Organizers need a way to invite participants without knowing their email. The backend issues a unique, shareable token per event. The frontend builds the public URL (`https://app.happyrow.com/join/{token}`) and generates a QR code client-side.

Auth: Bearer JWT for token management. Public access for event preview via token.

## Decisions

| Decision           | Choice                                                     |
| ------------------ | ---------------------------------------------------------- |
| Token format       | UUID v4 (short enough for URLs, unguessable)               |
| QR code generation | Frontend (from share URL)                                  |
| Token scope        | One token per share link, multiple links per event allowed |
| Expiration         | Optional, set by organizer                                 |
| Revocation         | Organizer can deactivate a link                            |
| Join behavior      | Adds user as participant with status CONFIRMED             |

## Data Model

### Table `event_share_links`

| Column      | Type        | Notes                           |
| ----------- | ----------- | ------------------------------- |
| id          | UUID        | PK                              |
| eventId     | UUID        | FK to events, indexed           |
| token       | VARCHAR(36) | Unique, indexed                 |
| createdBy   | UUID        | FK to auth.users (organizer)    |
| expiresAt   | TIMESTAMP   | Nullable (null = no expiration) |
| isActive    | BOOLEAN     | Default true                    |
| maxUses     | INT         | Nullable (null = unlimited)     |
| currentUses | INT         | Default 0                       |
| createdAt   | TIMESTAMP   |                                 |

Unique constraint on `token`.

## What the Frontend Will Provide

### `POST /events/{eventId}/share`

Generate a new share link. Only the event organizer can call this.

```json
{
  "expiresAt": "2026-04-30T23:59:59Z",
  "maxUses": 50
}
```

Both fields are optional. If omitted: no expiration, unlimited uses.

### `DELETE /events/{eventId}/share/{tokenId}`

Deactivate a share link. No body.

## What the Backend Must Return

### `POST /events/{eventId}/share` -- response

```
201 Created
```

```json
{
  "identifier": "uuid-link-id",
  "eventId": "uuid-event",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "expiresAt": "2026-04-30T23:59:59Z",
  "isActive": true,
  "maxUses": 50,
  "currentUses": 0,
  "createdAt": 1711900000000
}
```

### `GET /events/{eventId}/share` -- response

List all share links for the event (organizer only).

```json
[
  {
    "identifier": "uuid-link-id",
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "expiresAt": "2026-04-30T23:59:59Z",
    "isActive": true,
    "maxUses": 50,
    "currentUses": 12,
    "createdAt": 1711900000000
  }
]
```

### `GET /events/join/{token}` -- response (PUBLIC, no auth)

Event preview for anyone with the token. Used for the landing page before joining.

```json
{
  "eventId": "uuid-event",
  "name": "BBQ du samedi",
  "description": "Un BBQ entre amis",
  "eventDate": "2026-04-05T14:00:00Z",
  "location": "Parc de la Tete d'Or",
  "type": "PARTY",
  "organizerName": "JeanD",
  "participantCount": 8,
  "isValid": true
}
```

Return `isValid: false` with a `reason` field if token is expired, inactive, or max uses reached.

```json
{
  "isValid": false,
  "reason": "TOKEN_EXPIRED"
}
```

Reasons: `TOKEN_EXPIRED`, `TOKEN_INACTIVE`, `MAX_USES_REACHED`, `TOKEN_NOT_FOUND`.

### `POST /events/join/{token}` -- response (auth required)

Join the event via share token. The authenticated user is added as a participant.

```json
{
  "identifier": "uuid-participant",
  "userId": "uuid-user",
  "userName": "Marie",
  "eventId": "uuid-event",
  "status": "CONFIRMED",
  "joinedAt": 1711900500000,
  "createdAt": 1711900500000
}
```

Backend must:

1. Validate the token (active, not expired, uses remaining)
2. Check user is not already a participant
3. Add participant with status CONFIRMED
4. Increment `currentUses` on the share link

If user is already a participant, return `409 Conflict`.

### `DELETE /events/{eventId}/share/{tokenId}` -- response

```
204 No Content
```

Sets `isActive = false`. Does not delete the record.

## API Summary

| Endpoint                            | Method | Auth               | Description             |
| ----------------------------------- | ------ | ------------------ | ----------------------- |
| `/events/{eventId}/share`           | POST   | Bearer (organizer) | Generate share link     |
| `/events/{eventId}/share`           | GET    | Bearer (organizer) | List share links        |
| `/events/{eventId}/share/{tokenId}` | DELETE | Bearer (organizer) | Deactivate share link   |
| `/events/join/{token}`              | GET    | Public             | Event preview via token |
| `/events/join/{token}`              | POST   | Bearer             | Join event via token    |

## Field Naming

| Field       | Type           | Description                         |
| ----------- | -------------- | ----------------------------------- |
| identifier  | string         | Share link UUID                     |
| token       | string         | Unique shareable token              |
| expiresAt   | string or null | ISO timestamp, null = no expiration |
| isActive    | boolean        | Whether the link is usable          |
| maxUses     | number or null | Max join count, null = unlimited    |
| currentUses | number         | Number of times used                |
| isValid     | boolean        | Token validity check result         |
| reason      | string         | Invalidity reason code              |

## Error Codes

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| 401    | Missing or invalid JWT (for POST join)                 |
| 403    | User is not the event organizer (for share management) |
| 404    | Token not found                                        |
| 409    | User already a participant                             |
| 410    | Token expired or max uses reached                      |

## What the Frontend Handles

- QR code generation from share URL (using a JS library)
- Copy-to-clipboard for share URL
- Share link management UI (list, create, revoke)
- Join page: show event preview, then join button
- Redirect to event detail after successful join
