# Bottom Navbar Overlay Fix

## Issue

The bottom navbar was covering the last event card on the home page, making it partially inaccessible.

## Root Cause

The bottom navbar is positioned fixed at the bottom with `background: transparent` and has additional padding for iOS safe areas. The content padding-bottom wasn't accounting for:

- Navbar height (56px buttons + padding)
- iOS safe area inset (varies by device)
- Additional spacing buffer

## Fix Applied

Increased `padding-bottom` on `.home-screen` to ensure content is never covered by the navbar:

### Desktop (> 768px)

- **Before**: `padding-bottom: 120px`
- **After**: `padding-bottom: 140px`

### Tablet (≤ 768px)

- **Before**: `padding-bottom: 100px`
- **After**: `padding-bottom: 120px`

### Mobile (≤ 480px)

- **Before**: `padding-bottom: 90px`
- **After**: `padding-bottom: 110px`

## What's Fixed

✅ Last event card no longer covered by navbar  
✅ All content scrollable and accessible  
✅ Proper spacing on all screen sizes  
✅ iOS safe area accommodated  
✅ No legacy header added (bottom navbar only)

## Files Modified

1. `src/features/home/views/HomeView.css` - Increased padding-bottom
2. `src/layouts/AppLayout/AppLayout.tsx` - Reverted AppHeader addition

## Testing

- ✅ Build successful
- ✅ All tests passing (54/54)
- ✅ Content properly spaced from navbar
- ✅ Responsive across all breakpoints

## UI Structure (Correct)

```
┌─────────────────────────────────┐
│                                 │
│ Home Content                    │
│ - Event cards                   │
│ - Scrollable                    │
│                                 │
│ [Extra padding: 140px]          │ ← FIXED: Increased spacing
├─────────────────────────────────┤
│ Bottom Navbar (Floating)        │
│ [Home] [Profile]    [+ Create]  │
└─────────────────────────────────┘
```
