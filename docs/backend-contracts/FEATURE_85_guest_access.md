# Backend Contract: Guest Access (No Account Required)

> Issue #85 — `feat: invitation sans compte (guest access)`
>
> Depends on: Issue #73 (share link)

## Context

A guest can view an event and contribute without creating an account, then convert to a full account later. This removes the main friction barrier for new users arriving via share links.

## Decisions

| Decision           | Choice                                                   |
| ------------------ | -------------------------------------------------------- |
| Guest identity     | Guest JWT with limited scope                             |
| Guest scope        | Single event only                                        |
| Session duration   | 7 days (configurable)                                    |
| Conversion         | All guest data migrated to new account                   |
| Guest capabilities | View event, set status, contribute                       |
| Guest restrictions | Cannot create events, access other events, invite others |

## Data Model

### Table `guest_sessions`

| Column     | Type         | Notes                         |
| ---------- | ------------ | ----------------------------- |
| id         | UUID         | PK                            |
| guestId    | UUID         | Unique guest identifier       |
| guestName  | VARCHAR(100) | Display name chosen by guest  |
| shareToken | VARCHAR(36)  | FK to event_share_links.token |
| eventId    | UUID         | FK to events                  |
| createdAt  | TIMESTAMP    |                               |
| expiresAt  | TIMESTAMP    | Default: createdAt + 7 days   |

## What the Frontend Will Provide

### `POST /events/join/{token}/guest`

Join as guest via share token. No auth required.

```json
{
  "guestName": "Marie"
}
```

### `POST /auth/convert-guest`

Convert guest session to full account.

```json
{
  "email": "marie@example.com",
  "password": "securepassword",
  "firstname": "Marie",
  "lastname": "Dupont",
  "guestToken": "eyJhbGciOi..."
}
```

### Guest API calls

For all subsequent API calls, the guest uses the guest JWT in the `Authorization: Bearer` header, same as regular users. The backend differentiates by checking the `role` claim in the JWT.

## What the Backend Must Return

### `POST /events/join/{token}/guest` -- response

```
201 Created
```

```json
{
  "guestToken": "eyJhbGciOiJIUzI1NiIs...",
  "guestId": "uuid-guest",
  "guestName": "Marie",
  "eventId": "uuid-event",
  "expiresAt": "2026-04-12T14:00:00Z",
  "participant": {
    "identifier": "uuid-participant",
    "userId": "uuid-guest",
    "userName": "Marie",
    "eventId": "uuid-event",
    "status": "CONFIRMED",
    "joinedAt": 1711900500000,
    "createdAt": 1711900500000
  }
}
```

### Guest JWT payload

```json
{
  "sub": "uuid-guest",
  "role": "guest",
  "eventId": "uuid-event",
  "guestName": "Marie",
  "exp": 1712504400
}
```

### Allowed guest endpoints

| Endpoint                                                 | Method   | Guest Access                 |
| -------------------------------------------------------- | -------- | ---------------------------- |
| `/events/{eventId}`                                      | GET      | Yes (if eventId matches JWT) |
| `/events/{eventId}/participants`                         | GET      | Yes                          |
| `/events/{eventId}/resources`                            | GET      | Yes                          |
| `/events/{eventId}/participants/{guestId}`               | PUT      | Yes (own status only)        |
| `/events/{eventId}/resources/{resourceId}/contributions` | POST     | Yes                          |
| `/events/{eventId}/resources/{resourceId}/contributions` | DELETE   | Yes (own contributions)      |
| `/events/{eventId}/messages`                             | GET/POST | Yes                          |
| All other endpoints                                      | \*       | No (403 Forbidden)           |

### `POST /auth/convert-guest` -- response

```
201 Created
```

```json
{
  "user": {
    "id": "uuid-new-user",
    "email": "marie@example.com",
    "firstname": "Marie",
    "lastname": "Dupont"
  },
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "migratedData": {
    "participantsUpdated": 1,
    "contributionsUpdated": 3
  }
}
```

### Conversion process (backend)

1. Create user account in Supabase auth
2. Update all participant records: `userId = guestId` to `userId = newUserId`
3. Update all contribution records: `userId = guestId` to `userId = newUserId`
4. Update message records: `userId = guestId` to `userId = newUserId`
5. Invalidate the guest session
6. Return new auth tokens

## API Summary

| Endpoint                     | Method | Auth         | Description                   |
| ---------------------------- | ------ | ------------ | ----------------------------- |
| `/events/join/{token}/guest` | POST   | Public       | Join as guest                 |
| `/auth/convert-guest`        | POST   | Guest Bearer | Convert guest to full account |

## Error Codes

| Status | Condition                                                |
| ------ | -------------------------------------------------------- |
| 400    | Empty guestName, invalid conversion data                 |
| 401    | Expired or invalid guest token                           |
| 403    | Guest accessing unauthorized endpoint or different event |
| 404    | Share token not found                                    |
| 409    | Email already registered (during conversion)             |
| 410    | Share token expired or inactive                          |

## What the Frontend Handles

- Guest join page (name input only, no email/password)
- Storing guest JWT in memory/localStorage
- Banner "Create an account to save your data" on guest sessions
- Conversion form (email, password, name)
- Seamless transition from guest to authenticated session
- Clearing guest token after conversion
