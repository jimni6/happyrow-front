# Backend Contract: Event Budget

> Issue #90 — `feat: cagnotte / budget d'evenement`
>
> Depends on: Issue #87 (expense splitting -- `event_expenses` table)

## Context

Define a global budget for an event, track expenses in real-time, and see the remaining balance. The budget is linked to expenses from the Tricount-like feature (#87): `totalSpent` is computed from the `event_expenses` table.

Auth: Bearer JWT. Only the event organizer can create/update/delete the budget. All participants can view it.

## Decisions

| Decision             | Choice                                                            |
| -------------------- | ----------------------------------------------------------------- |
| One budget per event | Yes (UNIQUE constraint on eventId)                                |
| Who can create/edit  | Event organizer only                                              |
| Who can view         | All event participants                                            |
| Computed fields      | totalSpent, remaining, percentUsed (not stored, computed on read) |
| Alerts               | Informational flags for 80% and 100% thresholds                   |
| Category breakdown   | Uses `category` field from `event_expenses` (#87)                 |

## Data Model

### Table `event_budgets`

| Column      | Type          | Notes                        |
| ----------- | ------------- | ---------------------------- |
| id          | UUID          | PK                           |
| eventId     | UUID          | FK to events, UNIQUE         |
| totalBudget | DECIMAL(10,2) | Budget ceiling               |
| currency    | VARCHAR(3)    | Default 'EUR'                |
| createdBy   | UUID          | FK to auth.users (organizer) |
| createdAt   | TIMESTAMP     |                              |
| updatedAt   | TIMESTAMP     |                              |

### Extension to `event_expenses` (from #87)

The `category` column on `event_expenses` is required for budget breakdown. See FEATURE_87 for the column definition.

## What the Frontend Will Provide

### `POST /events/{eventId}/budget`

```json
{
  "totalBudget": 200.0,
  "currency": "EUR"
}
```

### `PUT /events/{eventId}/budget`

All fields optional. Only provided fields are updated.

```json
{
  "totalBudget": 250.0
}
```

## What the Backend Must Return

### `GET /events/{eventId}/budget` -- response

All spending fields are computed at read time from `event_expenses`.

```json
{
  "identifier": "uuid",
  "eventId": "uuid",
  "totalBudget": 200.0,
  "currency": "EUR",
  "totalSpent": 125.5,
  "remaining": 74.5,
  "percentUsed": 62.75,
  "expenseCount": 3,
  "expensesByCategory": [
    { "category": "FOOD", "amount": 80.0 },
    { "category": "DRINK", "amount": 45.5 }
  ],
  "alerts": [
    { "type": "BUDGET_80_PERCENT", "triggered": false },
    { "type": "BUDGET_EXCEEDED", "triggered": false }
  ],
  "createdBy": "uuid",
  "createdAt": 1711900000000,
  "updatedAt": 1711900500000
}
```

Computed fields:

- `totalSpent` = `SUM(amount) FROM event_expenses WHERE eventId = :eventId`
- `remaining` = `totalBudget - totalSpent` (can be negative)
- `percentUsed` = `(totalSpent / totalBudget) * 100`, rounded to 2 decimals
- `expensesByCategory` = grouped by category, only categories with expenses
- `alerts[BUDGET_80_PERCENT].triggered` = true when `percentUsed >= 80`
- `alerts[BUDGET_EXCEEDED].triggered` = true when `totalSpent > totalBudget`

### `POST /events/{eventId}/budget` -- response

```
201 Created
```

Returns the budget with computed fields (same shape as GET). Returns `409 Conflict` if a budget already exists for this event.

### `PUT /events/{eventId}/budget` -- response

Returns the updated budget with recomputed fields.

### `DELETE /events/{eventId}/budget` -- response

```
204 No Content
```

Deletes the budget record. Does NOT delete associated expenses (those belong to #87).

## API Summary

| Endpoint                   | Method | Auth                 | Description                       |
| -------------------------- | ------ | -------------------- | --------------------------------- |
| `/events/{eventId}/budget` | POST   | Bearer (organizer)   | Create budget                     |
| `/events/{eventId}/budget` | GET    | Bearer (participant) | Get budget with computed spending |
| `/events/{eventId}/budget` | PUT    | Bearer (organizer)   | Update budget amount              |
| `/events/{eventId}/budget` | DELETE | Bearer (organizer)   | Remove budget                     |

## Field Naming

| Field              | Type     | Stored/Computed | Description                  |
| ------------------ | -------- | --------------- | ---------------------------- |
| identifier         | string   | Stored          | Budget UUID                  |
| eventId            | string   | Stored          | Event UUID                   |
| totalBudget        | number   | Stored          | Budget ceiling (2 decimals)  |
| currency           | string   | Stored          | ISO currency code            |
| totalSpent         | number   | Computed        | Sum of all event expenses    |
| remaining          | number   | Computed        | totalBudget - totalSpent     |
| percentUsed        | number   | Computed        | Percentage of budget used    |
| expenseCount       | number   | Computed        | Number of expenses           |
| expensesByCategory | object[] | Computed        | Spending grouped by category |
| alerts             | object[] | Computed        | Threshold alert flags        |

## Error Codes

| Status | Condition                                                 |
| ------ | --------------------------------------------------------- |
| 401    | Missing or invalid JWT                                    |
| 403    | User is not the event organizer (for POST/PUT/DELETE)     |
| 404    | Event not found, or no budget exists (for GET/PUT/DELETE) |
| 409    | Budget already exists for this event (for POST)           |

## What the Frontend Handles

- Budget creation form (amount input)
- Budget dashboard with progress bar (percentUsed)
- Color coding: green (below 80%), orange (80-99%), red (100%+)
- Category breakdown chart
- Alert banners when thresholds are crossed
- Link to expense list (#87) from budget view
