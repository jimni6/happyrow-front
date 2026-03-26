# Backend Contract: Calendar View

> Issue #88 — `feat: vue calendrier des evenements`

## Context

Display events in a calendar layout (month/week) as an alternative to the current list view.

## Backend Impact

**No backend change required.**

The existing `GET /events` endpoint returns all event data needed for calendar rendering.

### Existing data used

Each event from `GET /events` includes:

```json
{
  "identifier": "uuid",
  "name": "BBQ du samedi",
  "eventDate": "2026-04-05T14:00:00Z",
  "type": "PARTY",
  "location": "Parc de la Tete d'Or"
}
```

The `eventDate` and `type` fields are sufficient to plot events on a calendar grid with color coding by type.

### Future optimization

If the event list grows large, the search/filter endpoint from #75 (`?dateFrom=&dateTo=`) can be used to load only events for the visible month/week range, reducing payload size.

## What the Frontend Handles

- Month and week calendar views
- Toggle between list and calendar on home page
- Event dots/badges on calendar days
- Color coding by event type (using design tokens)
- Click on day to see events for that date
- Click on event to navigate to detail page
- Navigation between months/weeks
- Responsive: week view default on mobile, month view on desktop
