# Backend Contract: Pre-filled event templates (Issue #79)

## Context

Users create events faster when templates (BBQ, birthday, brunch, apéro, dinner, Christmas, etc.) suggest default resources by event type. Templates should be **backend-served** so copy and resource lists can change without a frontend deploy.

The frontend uses template data to pre-fill event creation: for each template resource, it multiplies `suggestedQuantityPerPerson` by the expected number of participants to compute `suggestedQuantity` when creating `Resource` rows on the event (aligned with the existing `Resource` model: `suggestedQuantity`, `category`, etc.).

**Authentication:** Both `GET /templates` and `GET /templates/{id}` require a valid Bearer token (Supabase JWT): `Authorization: Bearer <jwt>`.

There is **no** `POST` / `PUT` / `DELETE` for templates in this iteration; templates are seeded or managed by admin processes outside the public API.

## Decisions

| Decision           | Choice                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Template storage   | Table `event_templates` + `resources` as JSONB array on each row                              |
| Admin CRUD         | Out of scope; data loaded via migrations or internal tools                                    |
| Ordering           | `sortOrder` ascending for list endpoint                                                       |
| Inactive templates | `isActive = false` excluded from `GET /templates` (and optionally from `GET /templates/{id}`) |

## What the frontend will provide

### `GET /templates`

- Standard `Authorization: Bearer <jwt>` header only.
- Optional query parameters (future): locale, `type` filter. Not required for v1 unless backend adds them.

### `GET /templates/{id}`

- Bearer token.
- `id` is the template `identifier` returned in the list.

### Resource creation from a template

The frontend does **not** send template definitions to the backend when saving an event. It:

1. Fetches a template (list or by id).
2. Lets the user adjust participant count and template selection in the UI.
3. Creates the event and resources via existing `POST /events` and `POST /events/{eventId}/resources` (or batch flow), setting `suggestedQuantity` = `suggestedQuantityPerPerson * expectedParticipants` (rounded per product rules).

## What the backend must return

### New persistence: `event_templates`

| Column        | Type             | Notes                                                                    |
| ------------- | ---------------- | ------------------------------------------------------------------------ |
| `id`          | UUID (PK)        | Exposed as `identifier` in API                                           |
| `name`        | string           | Display name, e.g. "Barbecue"                                            |
| `type`        | enum / string    | Same values as `Event.type`: `PARTY`, `BIRTHDAY`, `DINER`, `SNACK`, etc. |
| `description` | text             | Short description for UI                                                 |
| `icon_url`    | string, nullable | Path or URL, e.g. `/icons/bbq.svg`                                       |
| `resources`   | JSONB            | Array of suggested items (see schema below)                              |
| `is_active`   | boolean          | If false, omit from public list                                          |
| `sort_order`  | integer          | List ordering                                                            |
| `created_at`  | timestamp        |                                                                          |
| `updated_at`  | timestamp        |                                                                          |

### JSONB item shape inside `resources`

Each element:

| Property                     | Type   | Description                                                                     |
| ---------------------------- | ------ | ------------------------------------------------------------------------------- |
| `name`                       | string | Resource name                                                                   |
| `category`                   | string | `FOOD`, `DRINK`, `UTENSIL`, `DECORATION`, `OTHER` (same as `Resource.category`) |
| `suggestedQuantityPerPerson` | number | Multiplier for the frontend to compute `suggestedQuantity`                      |

### `GET /templates` -- response (200 OK)

Returns an array of active templates, sorted by `sortOrder` ascending.

```json
[
  {
    "identifier": "uuid",
    "name": "Barbecue",
    "type": "PARTY",
    "description": "Un BBQ entre amis avec grillades et boissons fraîches",
    "iconUrl": "/icons/bbq.svg",
    "resources": [
      {
        "name": "Saucisses",
        "category": "FOOD",
        "suggestedQuantityPerPerson": 2
      },
      { "name": "Pain", "category": "FOOD", "suggestedQuantityPerPerson": 1 },
      {
        "name": "Bières",
        "category": "DRINK",
        "suggestedQuantityPerPerson": 3
      },
      { "name": "Sodas", "category": "DRINK", "suggestedQuantityPerPerson": 2 },
      {
        "name": "Assiettes",
        "category": "UTENSIL",
        "suggestedQuantityPerPerson": 1
      },
      {
        "name": "Serviettes",
        "category": "UTENSIL",
        "suggestedQuantityPerPerson": 2
      }
    ],
    "sortOrder": 1
  }
]
```

List items may omit heavy fields if the backend prefers a summary variant; if so, document it. The recommended contract is full `resources` in the list for fewer round-trips, or a slim list + `GET /templates/{id}` for detail.

### `GET /templates/{id}` -- response (200 OK)

Returns a single template object with the same shape as one element in the array above, including the full `resources` array.

Errors: `404` if id unknown or template inactive (if inactive templates are hidden from API).

## API summary

| Endpoint          | Method | Auth   | Description                                   |
| ----------------- | ------ | ------ | --------------------------------------------- |
| `/templates`      | GET    | Bearer | List active templates, ordered by `sortOrder` |
| `/templates/{id}` | GET    | Bearer | Single template with full `resources`         |

No `POST` / `PUT` / `DELETE` in this contract.

## Field naming in API

| Field                        | Type           | Context       | Description                                                                        |
| ---------------------------- | -------------- | ------------- | ---------------------------------------------------------------------------------- |
| `identifier`                 | string (UUID)  | Template      | Template id (maps to DB `id`)                                                      |
| `name`                       | string         | Template      | Display name                                                                       |
| `type`                       | string         | Template      | `EventType` value for suggested default event type                                 |
| `description`                | string         | Template      | Marketing / helper text                                                            |
| `iconUrl`                    | string \| null | Template      | Relative path or absolute URL for icon asset                                       |
| `resources`                  | array          | Template      | Suggested resources; not persisted as `Resource` rows until user creates event     |
| `sortOrder`                  | number         | Template      | Order in list                                                                      |
| `name`                       | string         | Resource item | Suggested resource name                                                            |
| `category`                   | string         | Resource item | `FOOD`, `DRINK`, `UTENSIL`, `DECORATION`, `OTHER`                                  |
| `suggestedQuantityPerPerson` | number         | Resource item | Per-person multiplier; frontend computes `suggestedQuantity` for `POST /resources` |

### Optional fields on template detail (if added later)

| Field       | Type   | Description |
| ----------- | ------ | ----------- |
| `createdAt` | number | Epoch ms    |
| `updatedAt` | number | Epoch ms    |

Include only if the backend exposes them; not required for the minimal list contract above.

## What the frontend handles on its side

- Template picker UI and mapping `type` to new event defaults.
- Multiplying `suggestedQuantityPerPerson` by expected participants to set `suggestedQuantity` on created resources.
- Loading icons from `iconUrl` (public or CDN paths as configured).
