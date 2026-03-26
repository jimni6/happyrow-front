# Backend Contract: Generated Shopping List

> Issue #81 — `feat: liste de courses generee a partir des ressources manquantes`

## Context

Aggregate all missing resources (suggestedQuantity - currentQuantity) into a shareable checklist. The data needed already exists in the resources API (`currentQuantity`, `suggestedQuantity`), so this can be computed frontend-side or via a dedicated backend endpoint.

Auth: Bearer JWT.

## Decisions

| Decision             | Choice                                                                |
| -------------------- | --------------------------------------------------------------------- |
| Computation location | Backend endpoint recommended (single request, consistent logic)       |
| Fallback             | Frontend can compute from existing `GET /events/{eventId}/resources`  |
| Checked items        | Stored per-user in backend (optional, can use localStorage initially) |

## Option A: Dedicated Backend Endpoint (recommended)

### `GET /events/{eventId}/shopping-list`

Returns only resources where `suggestedQuantity > currentQuantity`, grouped by category.

#### Response

```json
{
  "eventId": "uuid",
  "items": [
    {
      "resourceId": "uuid-1",
      "name": "Saucisses",
      "category": "FOOD",
      "needed": 6,
      "current": 2,
      "missing": 4
    },
    {
      "resourceId": "uuid-2",
      "name": "Bieres",
      "category": "DRINK",
      "needed": 24,
      "current": 12,
      "missing": 12
    }
  ],
  "totalItems": 2,
  "completionPercent": 45.0
}
```

- `needed` = `suggestedQuantity`
- `current` = `currentQuantity`
- `missing` = `needed - current` (only items where `missing > 0`)
- `completionPercent` = overall completion across all resources with a `suggestedQuantity`
- Items sorted by category, then by name

Resources without a `suggestedQuantity` are excluded.

## Option B: Frontend-Only Computation

No backend change. The frontend computes the shopping list from the existing `GET /events/{eventId}/resources` response by filtering resources where `suggestedQuantity > currentQuantity`.

This works but requires the frontend to fetch all resources and compute client-side.

## API Summary

| Endpoint                          | Method | Auth   | Description                             |
| --------------------------------- | ------ | ------ | --------------------------------------- |
| `/events/{eventId}/shopping-list` | GET    | Bearer | Aggregated missing resources (Option A) |

## Field Naming

| Field             | Type   | Description                             |
| ----------------- | ------ | --------------------------------------- |
| resourceId        | string | Resource UUID                           |
| name              | string | Resource name                           |
| category          | string | FOOD, DRINK, UTENSIL, DECORATION, OTHER |
| needed            | number | suggestedQuantity                       |
| current           | number | currentQuantity                         |
| missing           | number | needed - current                        |
| totalItems        | number | Count of incomplete resources           |
| completionPercent | number | Overall event resource completion       |

## What the Frontend Handles

- Shopping list view with items grouped by category
- Checkbox to mark items as "bought" (localStorage or future backend persistence)
- Share as text (copy formatted list to clipboard)
- Link sharing (deep link to shopping list view)
- Pull-to-refresh to update quantities
