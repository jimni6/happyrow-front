# Backend Contract: Dark Mode

> Issue #78 — `feat: dark mode`

## Context

Add a dark theme for visual comfort, with automatic detection of system preferences and a manual toggle.

## Backend Impact

**No backend change required.**

The design token system (`src/core/styles/tokens/`) is already in place. Dark mode is implemented via CSS custom property overrides scoped to a `[data-theme="dark"]` attribute on the root element.

User preference is stored in `localStorage`.

### Future consideration

If cross-device preference sync is desired later, the backend could store the theme preference in the user profile (`user_profiles` from #77):

```json
{
  "themePreference": "dark" | "light" | "system"
}
```

This is NOT required for MVP.

## What the Frontend Handles

- Dark color palette in design tokens (`colors.css`)
- `[data-theme="dark"]` CSS overrides for all token values
- Toggle component in header or profile
- `prefers-color-scheme` media query detection
- Persistence in `localStorage` key `happyrow-theme`
- Smooth transition between themes
- WCAG AA contrast verification for dark palette
