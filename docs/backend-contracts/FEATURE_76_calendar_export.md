# Backend Contract: Calendar Export (.ics)

> Issue #76 — `feat: export vers Google Calendar / Apple Calendar (.ics)`

## Context

Add events to the user's phone/desktop calendar with one click via .ics file generation. Compatible with Google Calendar, Apple Calendar, and Outlook.

## Backend Impact

**No backend change required.**

The .ics file is generated client-side from existing event data.

### Existing data used

`GET /events/{id}` already returns:

```json
{
  "identifier": "uuid",
  "name": "BBQ du samedi",
  "description": "Un BBQ entre amis",
  "eventDate": "2026-04-05T14:00:00Z",
  "location": "Parc de la Tete d'Or, Lyon"
}
```

The frontend generates a .ics file:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//HappyRow//Event//FR
BEGIN:VEVENT
UID:uuid@happyrow.com
DTSTART:20260405T140000Z
SUMMARY:BBQ du samedi
DESCRIPTION:Un BBQ entre amis\n\nVoir sur HappyRow: https://app.happyrow.com/events/uuid
LOCATION:Parc de la Tete d'Or, Lyon
END:VEVENT
END:VCALENDAR
```

The file is offered as a Blob download or opened via `URL.createObjectURL()`.

## What the Frontend Handles

- "Add to calendar" button on event detail page
- .ics file generation from Event data
- Download trigger via Blob URL
- Include HappyRow event link in description
- Handle missing optional fields (location, description)
