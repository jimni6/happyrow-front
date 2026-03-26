# Backend Contract: Complete Editable Profile

> Issue #77 — `feat: profil complet et editable`

## Context

Enrich the user profile with photo, bio, phone, and dietary preferences. Currently the profile page is basic (name, email, sign out) with a "coming soon" badge. User data lives in Supabase auth but needs a dedicated profile table for extended fields.

Auth: Bearer JWT on all endpoints.

## Decisions

| Decision                   | Choice                                               |
| -------------------------- | ---------------------------------------------------- |
| Storage                    | New `user_profiles` table (separate from auth.users) |
| Avatar storage             | Supabase Storage or S3-compatible bucket             |
| Dietary preferences format | JSONB array of strings                               |
| Profile creation           | Auto-created on first GET (lazy initialization)      |
| Endpoint pattern           | `/users/me/profile` (uses JWT to identify user)      |

## Data Model

### Table `user_profiles`

| Column             | Type        | Notes                          |
| ------------------ | ----------- | ------------------------------ |
| userId             | UUID        | PK, FK to auth.users           |
| bio                | TEXT        | Nullable, max 500 chars        |
| phone              | VARCHAR(20) | Nullable                       |
| avatarUrl          | TEXT        | Nullable, URL to stored image  |
| dietaryPreferences | JSONB       | Default '[]', array of strings |
| updatedAt          | TIMESTAMP   |                                |

Standard preference values: `vegetarian`, `vegan`, `gluten-free`, `lactose-free`, `halal`, `kosher`, `nut-allergy`, `shellfish-allergy`, `other`

## What the Frontend Will Provide

### `PUT /users/me/profile`

All fields optional, only provided fields are updated.

```json
{
  "firstname": "Jean",
  "lastname": "Dupont",
  "bio": "J'adore les BBQ!",
  "phone": "+33612345678",
  "dietaryPreferences": ["vegetarian", "gluten-free"]
}
```

`firstname` and `lastname` are updated in Supabase auth metadata. The other fields go to `user_profiles`.

### `POST /users/me/avatar`

Multipart form data with a single `avatar` file field. Max size: 2MB. Accepted formats: JPEG, PNG, WebP.

### `DELETE /users/me/avatar`

No body. Removes the avatar and sets `avatarUrl` to null.

## What the Backend Must Return

### `GET /users/me/profile` -- response

Merges data from auth.users and user_profiles.

```json
{
  "userId": "uuid",
  "email": "jean@example.com",
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

If no profile row exists yet, create one with defaults and return it (lazy init).

### `PUT /users/me/profile` -- response

Returns the full updated profile (same shape as GET).

### `POST /users/me/avatar` -- response

```
201 Created
```

```json
{
  "avatarUrl": "https://storage.happyrow.com/avatars/uuid.jpg"
}
```

### `DELETE /users/me/avatar` -- response

```
204 No Content
```

## API Summary

| Endpoint            | Method | Auth   | Description              |
| ------------------- | ------ | ------ | ------------------------ |
| `/users/me/profile` | GET    | Bearer | Get current user profile |
| `/users/me/profile` | PUT    | Bearer | Update profile fields    |
| `/users/me/avatar`  | POST   | Bearer | Upload avatar image      |
| `/users/me/avatar`  | DELETE | Bearer | Remove avatar            |

## Field Naming

| Field              | Type           | Description                 |
| ------------------ | -------------- | --------------------------- |
| userId             | string         | User UUID                   |
| email              | string         | From auth.users (read-only) |
| firstname          | string         | From auth metadata          |
| lastname           | string         | From auth metadata          |
| displayName        | string         | From auth metadata          |
| bio                | string or null | Free text, max 500 chars    |
| phone              | string or null | Phone number                |
| avatarUrl          | string or null | URL to avatar image         |
| dietaryPreferences | string[]       | Array of preference strings |

## Error Codes

| Status | Condition                                                     |
| ------ | ------------------------------------------------------------- |
| 400    | Invalid phone format, bio too long, invalid image format/size |
| 401    | Missing or invalid JWT                                        |
| 413    | Avatar file too large (> 2MB)                                 |

## What the Frontend Handles

- Profile edit form with validation
- Avatar upload with preview and crop (optional)
- Dietary preferences multi-select
- Phone format validation (international format)
- Save confirmation toast
