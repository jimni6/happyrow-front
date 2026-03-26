# Backend Contract: Expense Splitting (Tricount-like)

> Issue #87 — `feat: partage de frais (Tricount-like)`

## Context

Add expenses to an event, split costs among participants, and calculate who owes whom. This is a core financial feature that avoids relying on external tools like Tricount or Splitwise.

Auth: Bearer JWT on all endpoints. Only event participants can view/create expenses.

## Decisions

| Decision             | Choice                                              |
| -------------------- | --------------------------------------------------- |
| Currency             | EUR by default, stored per expense                  |
| Split types          | `equal` for now (future: percentage, exact amounts) |
| Debt simplification  | Backend computes minimal transactions               |
| Who can create       | Any event participant                               |
| Who can edit/delete  | Expense creator only                                |
| Category on expenses | Optional field for budget grouping (#90)            |

## Data Model

### Table `event_expenses`

| Column      | Type          | Notes                                                                |
| ----------- | ------------- | -------------------------------------------------------------------- |
| id          | UUID          | PK                                                                   |
| eventId     | UUID          | FK to events, indexed                                                |
| description | TEXT          | e.g. "Courses Carrefour"                                             |
| amount      | DECIMAL(10,2) | Total expense amount                                                 |
| currency    | VARCHAR(3)    | Default 'EUR'                                                        |
| category    | VARCHAR(20)   | Nullable (FOOD, DRINK, UTENSIL, DECORATION, OTHER, VENUE, TRANSPORT) |
| paidBy      | UUID          | FK to auth.users (who paid)                                          |
| splitType   | VARCHAR(10)   | 'equal' (future: 'percentage', 'exact')                              |
| createdBy   | UUID          | FK to auth.users                                                     |
| createdAt   | TIMESTAMP     |                                                                      |
| updatedAt   | TIMESTAMP     |                                                                      |

### Table `expense_shares`

| Column      | Type          | Notes                |
| ----------- | ------------- | -------------------- |
| id          | UUID          | PK                   |
| expenseId   | UUID          | FK to event_expenses |
| userId      | UUID          | FK to auth.users     |
| shareAmount | DECIMAL(10,2) | Individual share     |
| isPaid      | BOOLEAN       | Default false        |
| paidAt      | TIMESTAMP     | Nullable             |

## What the Frontend Will Provide

### `POST /events/{eventId}/expenses`

```json
{
  "description": "Courses Carrefour",
  "amount": 45.5,
  "currency": "EUR",
  "category": "FOOD",
  "paidBy": "uuid-user-jean",
  "sharedWith": ["uuid-user-marie", "uuid-user-paul", "uuid-user-jean"],
  "splitType": "equal"
}
```

`sharedWith` can be an array of userIds or the string `"all"` to include all confirmed participants.

When `splitType` is `"equal"`, the backend divides `amount` equally among `sharedWith` users. Rounding differences go to the last share.

### `PUT /events/{eventId}/expenses/{expenseId}`

Same body as POST (all fields optional).

### `PUT /events/{eventId}/expenses/{expenseId}/shares/{userId}/pay`

No body. Marks the share as paid (`isPaid = true`, `paidAt = now()`).

## What the Backend Must Return

### `GET /events/{eventId}/expenses` -- response

```json
{
  "expenses": [
    {
      "identifier": "uuid-expense-1",
      "description": "Courses Carrefour",
      "amount": 45.5,
      "currency": "EUR",
      "category": "FOOD",
      "paidBy": {
        "userId": "uuid-user-jean",
        "userName": "JeanD"
      },
      "splitType": "equal",
      "shares": [
        {
          "userId": "uuid-user-marie",
          "userName": "Marie",
          "shareAmount": 15.17,
          "isPaid": false,
          "paidAt": null
        },
        {
          "userId": "uuid-user-paul",
          "userName": "Paul",
          "shareAmount": 15.17,
          "isPaid": true,
          "paidAt": 1711950000000
        },
        {
          "userId": "uuid-user-jean",
          "userName": "JeanD",
          "shareAmount": 15.16,
          "isPaid": true,
          "paidAt": null
        }
      ],
      "createdBy": "uuid-user-jean",
      "createdAt": 1711900000000,
      "updatedAt": null
    }
  ],
  "totalAmount": 45.5,
  "expenseCount": 1
}
```

The payer's own share is automatically marked as "paid" (they paid for it).

### `GET /events/{eventId}/balances` -- response

```json
{
  "balances": [
    { "userId": "uuid-user-marie", "userName": "Marie", "balance": -15.17 },
    { "userId": "uuid-user-paul", "userName": "Paul", "balance": 0.0 },
    { "userId": "uuid-user-jean", "userName": "JeanD", "balance": 15.17 }
  ],
  "settlements": [
    {
      "from": { "userId": "uuid-user-marie", "userName": "Marie" },
      "to": { "userId": "uuid-user-jean", "userName": "JeanD" },
      "amount": 15.17
    }
  ]
}
```

`balance`: positive = others owe you, negative = you owe others.

`settlements`: simplified debt transactions (minimum number of transfers).

### `DELETE /events/{eventId}/expenses/{expenseId}` -- response

```
204 No Content
```

Deletes the expense and all associated shares. Returns 403 if user is not the creator.

## API Summary

| Endpoint                                                     | Method | Auth   | Description                       |
| ------------------------------------------------------------ | ------ | ------ | --------------------------------- |
| `/events/{eventId}/expenses`                                 | GET    | Bearer | List all expenses                 |
| `/events/{eventId}/expenses`                                 | POST   | Bearer | Create expense with split         |
| `/events/{eventId}/expenses/{expenseId}`                     | GET    | Bearer | Get expense detail                |
| `/events/{eventId}/expenses/{expenseId}`                     | PUT    | Bearer | Update expense (creator only)     |
| `/events/{eventId}/expenses/{expenseId}`                     | DELETE | Bearer | Delete expense (creator only)     |
| `/events/{eventId}/balances`                                 | GET    | Bearer | Computed balances and settlements |
| `/events/{eventId}/expenses/{expenseId}/shares/{userId}/pay` | PUT    | Bearer | Mark share as paid                |

## Field Naming

| Field       | Type              | Description                               |
| ----------- | ----------------- | ----------------------------------------- |
| identifier  | string            | Expense UUID                              |
| description | string            | Expense description                       |
| amount      | number            | Total amount (2 decimal places)           |
| currency    | string            | ISO currency code (default EUR)           |
| category    | string or null    | Expense category                          |
| paidBy      | object            | { userId, userName }                      |
| splitType   | string            | "equal"                                   |
| sharedWith  | string[] or "all" | Request only: who to split with           |
| shares      | object[]          | Response only: computed individual shares |
| shareAmount | number            | Individual share (2 decimal places)       |
| isPaid      | boolean           | Share settled                             |
| balance     | number            | Net balance (positive = owed to you)      |
| settlements | object[]          | Simplified debt transactions              |

## Error Codes

| Status | Condition                                              |
| ------ | ------------------------------------------------------ |
| 400    | Invalid amount, empty description, unknown splitType   |
| 401    | Missing or invalid JWT                                 |
| 403    | User not participant, or not creator (for edit/delete) |
| 404    | Event or expense not found                             |

## What the Frontend Handles

- Expense creation form (description, amount, who paid, who shares)
- "All participants" or specific users selection
- Expense list grouped by date
- Balance summary with who owes whom
- "Mark as paid" action on individual shares
- Currency formatting (EUR with 2 decimals)
