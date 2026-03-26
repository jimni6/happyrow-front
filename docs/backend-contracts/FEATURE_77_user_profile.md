# Backend Contract: Full editable user profile (Issue #77)

## Context

The profile screen today is limited (name, email, sign out). Extended profile data (photo, bio, phone, dietary preferences) should live outside Supabase Auth payloads in a dedicated `user_profiles` table, while core identity (`email`, names from auth) remains in Supabase.

**Authentication:** All endpoints in this contract require a valid Bearer token (Supabase JWT): `Authorization: Bearer <jwt>`. The backend resolves `userId` from the JWT (`sub`); clients do not pass a user id in the URL for `me` routes.

## Decisions

| Decision                                  | Choice                                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Source of truth for email and legal names | Supabase Auth; profile table extends with bio, phone, avatar, dietary preferences                    |
| `displayName`                             | Returned in profile aggregate; sourced from metadata or profile overrides per existing product rules |
| Avatar upload                             | `POST /users/me/avatar` with `multipart/form-data`; storage URL returned as `avatarUrl`              |
| Dietary preferences                       | JSONB array of string tags (free-form or enum-like strings agreed with frontend)                     |

## What the frontend will provide

### `PUT /users/me/profile`

Request body: JSON. **All fields optional**; omitted fields are left unchanged (PATCH-like semantics on PUT).

```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "bio": "J'adore les BBQ!",
  "phone": "+33612345678",
  "dietaryPreferences": ["vegetarian", "gluten-free"]
}
```

- `firstname` / `lastname`: When provided, backend updates auth user metadata or linked identity store as per your stack, and reflects them on subsequent `GET`.
- `bio`, `phone`, `dietaryPreferences`: Stored on `user_profiles`.
- Empty string for `bio` or `phone` may clear the field if the API defines that behavior.

### `POST /users/me/avatar`

- `Content-Type: multipart/form-data`
- One file field (name to be agreed, for example `file` or `avatar`); image types (for example `image/jpeg`, `image/png`, `image/webp`).
- Backend stores the file (object storage), updates `user_profiles.avatar_url`, and returns the new `avatarUrl`.

### `DELETE /users/me/avatar`

- No body. Removes stored avatar object (or marks deleted) and clears `avatarUrl` on the profile.

### Headers

```
Authorization: Bearer <supabase_jwt>
```

## What the backend must return

### New persistence: `user_profiles`

| Column                | Type                        | Notes                                                                                   |
| --------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| `user_id`             | UUID (PK, FK to auth.users) | One row per user                                                                        |
| `bio`                 | text, nullable              |                                                                                         |
| `phone`               | text, nullable              |                                                                                         |
| `avatar_url`          | text, nullable              | HTTPS URL after upload                                                                  |
| `dietary_preferences` | JSONB                       | Array of strings, e.g. `["vegetarian", "gluten-free", "halal", "vegan", "nut-allergy"]` |
| `updated_at`          | timestamp                   |                                                                                         |

`created_at` on the profile row is optional but recommended for the `createdAt` field in API responses.

### `GET /users/me/profile` -- response (200 OK)

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "firstname": "Jean",
  "lastname": "Dupont",
  "displayName": "JeanD",
  "bio": "J'adore les BBQ!",
  "phone": "+33612345678",
  "avatarUrl": "https://storage.happyrow.com/avatars/uuid.jpg",
  "dietaryPreferences": ["vegetarian", "gluten-free"],
  "createdAt": 1711900000000,
  "updatedAt": 1711900500000
}
```

- On first access, if no profile row exists, the backend should create one with defaults or return the same shape with null/empty extended fields and timestamps set appropriately.
- `displayName` resolution should match the participant display name contract where applicable.

### `PUT /users/me/profile` -- response (200 OK)

Same JSON shape as `GET /users/me/profile`, reflecting the updated aggregate after apply.

Errors: `401` unauthorized; `400` validation (invalid phone format, dietary preference shape, etc.).

### `POST /users/me/avatar` -- response (200 OK)

Returns at minimum:

```json
{
  "avatarUrl": "https://storage.happyrow.com/avatars/uuid.jpg"
}
```

Alternatively, the API may return the full profile object as in `GET` for convenience; document the chosen behavior.

Errors: `401`; `400` if file missing, wrong type, or size limit exceeded; `413` if payload too large (if used).

### `DELETE /users/me/avatar` -- response (204 No Content)

Or `200 OK` with updated profile body including `avatarUrl: null`. Document the chosen pattern consistently.

## API summary

| Endpoint            | Method | Auth   | Description                                                 |
| ------------------- | ------ | ------ | ----------------------------------------------------------- |
| `/users/me/profile` | GET    | Bearer | Full profile for the authenticated user                     |
| `/users/me/profile` | PUT    | Bearer | Partial update of profile fields (all body fields optional) |
| `/users/me/avatar`  | POST   | Bearer | Upload avatar (`multipart/form-data`); returns `avatarUrl`  |
| `/users/me/avatar`  | DELETE | Bearer | Remove avatar and clear `avatarUrl`                         |

## Field naming in API

| Field                | Type           | Required in GET response | Description                                                               |
| -------------------- | -------------- | ------------------------ | ------------------------------------------------------------------------- |
| `userId`             | string (UUID)  | Yes                      | Auth user id                                                              |
| `email`              | string         | Yes                      | From Supabase Auth                                                        |
| `firstname`          | string \| null | Yes                      | From metadata / profile                                                   |
| `lastname`           | string \| null | Yes                      | From metadata / profile                                                   |
| `displayName`        | string \| null | Yes                      | Shown name in UI                                                          |
| `bio`                | string \| null | Yes                      | Short user bio                                                            |
| `phone`              | string \| null | Yes                      | E.164 or validated string                                                 |
| `avatarUrl`          | string \| null | Yes                      | Public URL to avatar image                                                |
| `dietaryPreferences` | string[]       | Yes                      | Tags such as `vegetarian`, `gluten-free`, `halal`, `vegan`, `nut-allergy` |
| `createdAt`          | number         | Yes                      | Epoch milliseconds (profile or account creation, document semantics)      |
| `updatedAt`          | number         | Yes                      | Epoch milliseconds                                                        |

### `PUT` request body (all optional)

| Field                | Type     | Description                                                                              |
| -------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `firstname`          | string   |                                                                                          |
| `lastname`           | string   |                                                                                          |
| `bio`                | string   |                                                                                          |
| `phone`              | string   |                                                                                          |
| `dietaryPreferences` | string[] | Replaces entire list when sent, or merge per backend rule (document if merge vs replace) |

## What the frontend handles on its side

- Profile form UI for bio, phone, dietary multi-select or tags, and name fields allowed by product.
- Image picker and upload to `POST /users/me/avatar`.
- Display of `avatarUrl` and fallbacks when null.
- Caching or refetch of profile after PUT/avatar operations.
