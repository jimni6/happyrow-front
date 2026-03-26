# Backend Contract: Social Sharing (WhatsApp / SMS / Social)

> Issue #86 — `feat: partage WhatsApp / SMS / reseaux sociaux`
>
> Depends on: Issue #73 (share link generation)

## Context

Native share buttons for WhatsApp, SMS, and other social platforms to spread event invitations. The share link itself comes from the share token feature (#73). This feature is mostly frontend (Web Share API, deep links), but the backend may need to serve Open Graph metadata for rich link previews.

Auth: The OG metadata endpoint should be public (no auth) for crawlers to access.

## Decisions

| Decision         | Choice                                             |
| ---------------- | -------------------------------------------------- |
| Share mechanism  | Web Share API (mobile), fallback buttons (desktop) |
| Link preview     | Open Graph meta tags for rich previews             |
| Share URL format | `https://app.happyrow.com/join/{token}`            |
| OG metadata      | Served by backend or SSR for crawler access        |

## Backend Change: Open Graph Metadata

When a share link is opened by a crawler (WhatsApp, Facebook, Twitter, iMessage), it needs to find Open Graph meta tags to generate a rich preview (title, description, image).

### `GET /events/join/{token}/og`

The backend (or a serverless function) should return HTML with OG tags when the User-Agent is a known crawler, or return JSON for the frontend to use.

Required OG tags:

```html
<meta property="og:title" content="BBQ du samedi -- HappyRow" />
<meta
  property="og:description"
  content="Jean t'invite a un evenement ! 8 participants, le 5 avril 2026"
/>
<meta
  property="og:image"
  content="https://app.happyrow.com/og-images/event-preview.png"
/>
<meta property="og:url" content="https://app.happyrow.com/join/{token}" />
<meta property="og:type" content="website" />
```

The OG image can be:

- A static branded image (simplest, MVP)
- A dynamically generated image with event details (advanced, via serverless)

### JSON endpoint alternative

```json
{
  "title": "BBQ du samedi",
  "description": "Jean t'invite ! 8 participants, le 5 avril 2026",
  "imageUrl": "https://app.happyrow.com/og-images/event-preview.png",
  "url": "https://app.happyrow.com/join/{token}"
}
```

## API Summary

| Endpoint                  | Method | Auth   | Description                   |
| ------------------------- | ------ | ------ | ----------------------------- |
| `/events/join/{token}/og` | GET    | Public | OG metadata for link previews |
| `/events/join/{token}`    | GET    | Public | Event preview (from #73)      |

## What the Frontend Handles

### Web Share API (mobile)

```javascript
navigator.share({
  title: 'BBQ du samedi -- HappyRow',
  text: 'Rejoins-nous sur HappyRow !',
  url: 'https://app.happyrow.com/join/{token}',
});
```

### Fallback Buttons (desktop)

- WhatsApp: `https://wa.me/?text={encodedMessage}`
- SMS: `sms:?body={encodedMessage}`
- Copy link: copy share URL to clipboard
- Email: `mailto:?subject={subject}&body={encodedMessage}`

The pre-formatted message includes: event name, date, location, and the share link.

## Backend Requirements Summary

1. Share token system from #73 (prerequisite)
2. OG metadata endpoint or server-side rendering for link previews
3. Event preview data accessible without authentication via share token

No other backend changes needed. The sharing logic (Web Share API, deep links) is entirely frontend.
