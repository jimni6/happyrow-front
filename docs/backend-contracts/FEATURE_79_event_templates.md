# Backend Contract: Event Templates

> Issue #79 — `feat: templates d'evenements pre-remplis`

## Context

Pre-filled event templates (BBQ, Birthday, Brunch, Apero, Dinner, Christmas...) with auto-suggested resources based on event type. Templates reduce creation friction and guide new users.

Recommended approach: backend-served templates so they can be updated without a frontend deploy.

Auth: Bearer JWT.

## Decisions

| Decision             | Choice                                                     |
| -------------------- | ---------------------------------------------------------- |
| Storage              | Backend table `event_templates`                            |
| Management           | Seed data / admin only (no public CRUD)                    |
| Resource quantities  | Per-person basis, frontend multiplies by participant count |
| Template count (MVP) | 5-6 templates                                              |

## Data Model

### Table `event_templates`

| Column      | Type         | Notes                                     |
| ----------- | ------------ | ----------------------------------------- |
| id          | UUID         | PK                                        |
| name        | VARCHAR(100) | e.g. "Barbecue"                           |
| type        | VARCHAR(20)  | EventType (PARTY, BIRTHDAY, DINER, SNACK) |
| description | TEXT         | Template description                      |
| iconUrl     | VARCHAR(255) | Path to template icon                     |
| resources   | JSONB        | Array of suggested resources              |
| isActive    | BOOLEAN      | Default true                              |
| sortOrder   | INT          | Display order                             |
| createdAt   | TIMESTAMP    |                                           |
| updatedAt   | TIMESTAMP    |                                           |

### Resource JSONB structure

```json
[
  {
    "name": "Saucisses",
    "category": "FOOD",
    "suggestedQuantityPerPerson": 2
  },
  {
    "name": "Bieres",
    "category": "DRINK",
    "suggestedQuantityPerPerson": 3
  }
]
```

## What the Frontend Will Provide

No request body — templates are read-only for regular users.

The frontend fetches templates at event creation, lets the user pick one, then creates the event with pre-filled data. The frontend computes `suggestedQuantity = suggestedQuantityPerPerson * expectedParticipantCount`.

## What the Backend Must Return

### `GET /templates` -- response

List all active templates, sorted by `sortOrder`.

```json
[
  {
    "identifier": "uuid",
    "name": "Barbecue",
    "type": "PARTY",
    "description": "Un BBQ entre amis avec grillades et boissons fraiches",
    "iconUrl": "/icons/bbq.svg",
    "resources": [
      {
        "name": "Saucisses",
        "category": "FOOD",
        "suggestedQuantityPerPerson": 2
      },
      { "name": "Pain", "category": "FOOD", "suggestedQuantityPerPerson": 1 },
      {
        "name": "Bieres",
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
  },
  {
    "identifier": "uuid",
    "name": "Anniversaire",
    "type": "BIRTHDAY",
    "description": "Fete d'anniversaire avec gateau et decorations",
    "iconUrl": "/icons/birthday.svg",
    "resources": [
      { "name": "Gateau", "category": "FOOD", "suggestedQuantityPerPerson": 1 },
      {
        "name": "Bougies",
        "category": "DECORATION",
        "suggestedQuantityPerPerson": 1
      },
      {
        "name": "Boissons",
        "category": "DRINK",
        "suggestedQuantityPerPerson": 2
      },
      {
        "name": "Assiettes",
        "category": "UTENSIL",
        "suggestedQuantityPerPerson": 1
      },
      {
        "name": "Ballons",
        "category": "DECORATION",
        "suggestedQuantityPerPerson": 2
      }
    ],
    "sortOrder": 2
  }
]
```

### `GET /templates/{id}` -- response

Single template with full detail. Same shape as one item in the list.

## API Summary

| Endpoint          | Method | Auth   | Description           |
| ----------------- | ------ | ------ | --------------------- |
| `/templates`      | GET    | Bearer | List active templates |
| `/templates/{id}` | GET    | Bearer | Get template detail   |

## Field Naming

| Field                                  | Type     | Description              |
| -------------------------------------- | -------- | ------------------------ |
| identifier                             | string   | Template UUID            |
| name                                   | string   | Template name            |
| type                                   | string   | EventType                |
| description                            | string   | Template description     |
| iconUrl                                | string   | Icon path                |
| resources                              | object[] | Suggested resources      |
| resources[].name                       | string   | Resource name            |
| resources[].category                   | string   | ResourceCategory         |
| resources[].suggestedQuantityPerPerson | number   | Quantity per participant |
| sortOrder                              | number   | Display order            |

## Seed Data (MVP)

The backend should seed these templates:

1. Barbecue (PARTY)
2. Anniversaire (BIRTHDAY)
3. Brunch (SNACK)
4. Apero (PARTY)
5. Diner (DINER)

## What the Frontend Handles

- Template selection screen at event creation
- "Start from scratch" option
- Preview of template resources
- Multiplying per-person quantities by expected participant count
- Allowing user to customize after template selection
