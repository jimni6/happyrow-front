# Backend Contract: Resource Progress Bar

> Issue #74 — `feat: barre de progression des ressources`

## Context

Display a visual progress bar for each resource showing completion percentage (currentQuantity / suggestedQuantity).

## Backend Impact

**No backend change required.**

All data needed is already available in the existing resource API response.

### Existing data used

`GET /events/{eventId}/resources` already returns for each resource:

```json
{
  "identifier": "uuid",
  "name": "Bieres",
  "category": "DRINK",
  "currentQuantity": 12,
  "suggestedQuantity": 24,
  "contributors": [...]
}
```

The frontend computes:

- `progressPercent = (currentQuantity / suggestedQuantity) * 100`
- Capped at 100% for display (even if currentQuantity > suggestedQuantity)
- Resources without `suggestedQuantity` show no progress bar

## What the Frontend Handles

- Progress bar component using design tokens (teal fill, coral remaining)
- Percentage label
- Animation on contribution change
- Complete state (100%) with visual feedback
- Handles edge cases: suggestedQuantity = 0 or null
