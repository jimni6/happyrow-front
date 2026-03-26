# Add Participant Feature Implementation

## Overview

Implementation of the participant addition feature directly from the HomeView via the existing "Add participant" button in EventCard, with a simplified modal form (email only, status INVITED by default).

## Date

February 2, 2026

## Changes Made

### 1. EventCard Component Enhancement

**File**: `src/features/home/components/EventCard.tsx`

- Added `onAddParticipant?: (eventId: string) => void` prop to interface
- Connected the existing "Add participant" button (third action button) to trigger the callback
- Button now calls `onAddParticipant?.(event.id)` with proper event propagation stop

### 2. New Component: AddParticipantModal

**Files**:

- `src/features/participants/components/AddParticipantModal.tsx`
- `src/features/participants/components/AddParticipantModal.css`

**Features**:

- Simplified modal form with only email input field
- Automatically sets participant status to `ParticipantStatus.INVITED`
- Built-in email validation (format check)
- Loading state during submission
- Error handling with user-friendly messages
- Auto-focus on email input for better UX
- Responsive design (mobile-first)

**Design Tokens Used**:

- Colors: `--color-navy`, `--color-teal`, `--color-coral`, `--bg-primary`
- Spacing: `--space-2`, `--space-3`, `--space-4`, `--space-5`
- Typography: `--text-base`, `--font-medium`, `--font-sans`
- Radius & Shadows: `--radius-lg`, `--shadow-md`
- Transitions: `--transition-base`, `--transition-all`

### 3. HomeView Integration

**File**: `src/features/home/views/HomeView.tsx`

**New State**:

- `addParticipantEventId: string | null` - tracks which event to add participant to

**New Functions**:

- `loadParticipantCountsForEvent(eventId)` - reloads participant count for specific event
- `handleAddParticipant(email)` - handles participant addition using `AddParticipant` use-case

**Integration Points**:

- Added imports for `AddParticipant`, `ParticipantStatus`, `AddParticipantModal`
- Pass `onAddParticipant` callback to each EventCard in the map
- Render `AddParticipantModal` conditionally when `addParticipantEventId` is set
- Automatic refresh of participant counts after successful addition

### 4. Export Update

**File**: `src/features/participants/index.ts`

- Added export for `AddParticipantModal` component

## Data Flow

```
User clicks "+" button in EventCard
    ↓
EventCard calls onAddParticipant(eventId)
    ↓
HomeView sets addParticipantEventId state
    ↓
AddParticipantModal opens
    ↓
User enters email and submits
    ↓
handleAddParticipant called
    ↓
AddParticipant use-case executed
    ↓
HttpParticipantRepository sends POST request
    ↓
On success: participant counts refreshed
    ↓
Modal closes automatically
```

## Architecture Pattern

Follows the established Clean Architecture pattern:

- **View Layer**: EventCard, HomeView, AddParticipantModal (UI components)
- **Use Case Layer**: AddParticipant (business logic)
- **Repository Layer**: HttpParticipantRepository (data access)

## Testing Checklist

### Manual Tests to Perform

- ✅ Build passes (`npm run build`)
- ✅ Lint passes (`npm run lint`)
- [ ] Click on "+" button opens the modal
- [ ] Submit with empty email shows validation error
- [ ] Submit with invalid email format shows error
- [ ] Submit with valid email adds participant
- [ ] Participant count increments after successful addition
- [ ] Modal closes after successful submission
- [ ] API errors are displayed correctly
- [ ] Loading state prevents multiple submissions
- [ ] Cancel button closes modal without changes
- [ ] Overlay click closes modal (when not loading)
- [ ] Responsive design works on mobile (< 768px)
- [ ] Keyboard navigation works (Tab, Enter, Escape)

## API Integration

**Endpoint**: `POST /events/{eventId}/participants`

**Request Body**:

```json
{
  "user_email": "participant@example.com",
  "status": "INVITED"
}
```

**Authentication**: Bearer token from Supabase session

## Design Consistency

- Uses Comic Neue font family (via `--font-sans`)
- Follows 8px spacing scale
- Consistent with Modal component styling
- Navy/Teal/Coral color scheme maintained
- Proper focus states and accessibility
- Mobile-responsive with proper breakpoints

## Known Limitations

1. No duplicate participant check before submission (handled by backend)
2. No autocomplete for email addresses
3. Status is hardcoded to INVITED (as per requirements)
4. No bulk participant addition capability

## Future Enhancements

Potential improvements for future iterations:

- Email autocomplete from user contacts
- Bulk participant addition (CSV import, multiple emails)
- Participant invitation customization (custom message)
- Real-time validation against existing participants
- Success toast notification after addition

## Related Files

### Modified

- `src/features/home/components/EventCard.tsx`
- `src/features/home/views/HomeView.tsx`
- `src/features/participants/index.ts`

### Created

- `src/features/participants/components/AddParticipantModal.tsx`
- `src/features/participants/components/AddParticipantModal.css`

### Reused (Existing Infrastructure)

- `src/features/participants/use-cases/AddParticipant.ts`
- `src/features/participants/services/HttpParticipantRepository.ts`
- `src/features/participants/types/Participant.ts`
- `src/shared/components/Modal/Modal.tsx`
