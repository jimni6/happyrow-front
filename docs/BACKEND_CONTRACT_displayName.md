# Backend Contract: Participant displayName

## Context

The frontend displays a list of participants per event. Currently the API returns `userId` (UUID) but rarely includes `userName`, so participants appear as truncated UUIDs in the UI.

The frontend will send a `displayName` when users register (stored in Supabase `user_metadata`). The backend must resolve and return this name when serving participant data.

## Decisions

| Decision                                   | Choice                                                      |
| ------------------------------------------ | ----------------------------------------------------------- |
| Field naming                               | `displayName`                                               |
| Required at email registration?            | Yes                                                         |
| Google OAuth users                         | `displayName` derived from Google `full_name` automatically |
| Prompt existing users to set displayName?  | No (deferred to a later iteration)                          |
| Who resolves displayName for participants? | **Backend** joins user data when returning participants     |

## What the frontend will provide

### On participant creation (`POST /events/{eventId}/participants`)

The frontend will now include `userName` when adding a participant:

```json
{
  "userId": "email@example.com",
  "userName": "Jean D."
}
```

> `userName` is the displayName of the user performing the action. This is a temporary measure so the backend can store it. Long-term, the backend should resolve displayName from its own user data, not rely on the frontend to provide it.

### User metadata in Supabase `auth.users`

After registration, `raw_user_meta_data` will contain:

**Email registration:**

```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "displayName": "JeanD"
}
```

**Google OAuth (populated automatically by Supabase):**

```json
{
  "full_name": "Jean Dupont",
  "given_name": "Jean",
  "family_name": "Dupont",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "email": "jean@gmail.com"
}
```

## What the backend must return

### `GET /events/{eventId}/participants` -- response

Each participant in the array **must** include `userName`:

```json
[
  {
    "identifier": "uuid-participant-1",
    "userId": "uuid-user-abc",
    "userName": "JeanD",
    "eventId": "uuid-event-123",
    "status": "CONFIRMED",
    "joinedAt": 1711900000000,
    "createdAt": 1711900000000,
    "updatedAt": null
  },
  {
    "identifier": "uuid-participant-2",
    "userId": "uuid-user-def",
    "userName": "Marie L.",
    "eventId": "uuid-event-123",
    "status": "INVITED",
    "joinedAt": 1711900500000,
    "createdAt": 1711900500000,
    "updatedAt": null
  }
]
```

### `POST /events/{eventId}/participants` -- response

Same shape as above for the created participant, `userName` included.

### `PUT /events/{eventId}/participants/{userId}` -- response

Same shape, `userName` included.

## displayName resolution logic (backend)

When returning participant data, the backend should resolve `userName` with this priority:

1. `displayName` from user metadata (set at email registration)
2. `full_name` from user metadata (set by Google OAuth)
3. `firstname + " " + lastname` from user metadata (if both present)
4. Email prefix (part before `@`) as last resort
5. `null` if nothing is available (frontend will show "Participant")

```
displayName > full_name > firstname lastname > email prefix > null
```

## API summary

| Endpoint                                  | Method | Change                                                                                |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------- |
| `/events/{eventId}/participants`          | GET    | Return `userName` for each participant (resolved from user data)                      |
| `/events/{eventId}/participants`          | POST   | Accept `userName` in request body (already supported). Return `userName` in response. |
| `/events/{eventId}/participants/{userId}` | PUT    | Return `userName` in response                                                         |
| `/events/{eventId}/participants/{userId}` | DELETE | No change                                                                             |

## Field naming in API

| Field      | Type             | Required in response | Description                              |
| ---------- | ---------------- | -------------------- | ---------------------------------------- |
| `userName` | `string \| null` | Yes (new)            | Resolved display name of the participant |

The frontend already handles `userName` via `HttpParticipantRepository.mapApiResponseToParticipant`. It supports both `userName` (camelCase) and `user_name` (snake_case) for backward compatibility. Either format works.

## What the frontend handles on its side

- Adding `displayName` field to email registration form (required)
- Mapping Google OAuth `full_name` / `given_name` / `family_name` into `User.displayName`
- Sending `userName` in `POST /participants` requests
- Improving fallback display when `userName` is `null` (shows "Participant" instead of truncated UUID)

## Timeline

Frontend Phase 1 (displayName in registration + Google OAuth fix + improved fallback) can ship independently. Backend enrichment of `userName` in GET responses is needed to fully resolve the issue for all participants.
