# Testing Checklist - CSS Refactoring

## Pre-Testing Setup

- [ ] Run `npm install` (if needed)
- [ ] Run `npm run dev` to start development server
- [ ] Open browser to `http://localhost:5173` (or your dev URL)
- [ ] Open browser DevTools Console (check for CSS errors)

---

## Visual Testing Checklist

### Authentication Views

#### Login Screen

- [ ] Page loads without errors
- [ ] Gradient background displays correctly
- [ ] White card is centered and rounded
- [ ] Input fields have proper borders and padding
- [ ] Focus state shows blue border and shadow
- [ ] Submit button has gradient background
- [ ] Submit button hover effect works (lift + shadow)
- [ ] Link buttons are styled correctly
- [ ] Error messages display in red box
- [ ] Loading state works (disabled button)

#### Register Screen

- [ ] Same as login screen checks
- [ ] All form fields render correctly
- [ ] Validation messages display properly

#### Forgot Password Screen

- [ ] Same as login screen checks
- [ ] Success message displays in green box

---

### Home Dashboard

#### Header

- [ ] Gradient logo text displays correctly
- [ ] User greeting shows on desktop
- [ ] User greeting hides on mobile (<768px)
- [ ] Sign out button is red
- [ ] Sign out button hover effect works

#### Welcome Section

- [ ] White card with rounded corners
- [ ] Shadow displays under card
- [ ] Text is centered and readable
- [ ] User info card shows with glass effect
- [ ] User avatar circle displays with gradient
- [ ] Status badge shows correct color

#### Events Grid

- [ ] Event cards display in responsive grid
- [ ] Cards have subtle gradient background
- [ ] Cards lift on hover with border highlight
- [ ] Card shadows increase on hover
- [ ] "View Event" buttons have gradient
- [ ] Button hover effects work

#### Quick Actions

- [ ] Action buttons display correctly
- [ ] Primary button has gradient + shadow
- [ ] Secondary button has gray background
- [ ] Hover effects work for both

---

### Event Details View

#### Header Bar

- [ ] Gradient background displays
- [ ] Back button is circular with shadow
- [ ] Back button hover effect works
- [ ] Event name is bold and large
- [ ] Edit button (teal) displays correctly
- [ ] Delete button (red) displays correctly
- [ ] Button hover effects work

#### Info Bar

- [ ] White card with rounded corners
- [ ] Location and date info display correctly
- [ ] Icons are visible

#### Participants Section

- [ ] White card with padding
- [ ] "Add Participant" button has gradient
- [ ] Participant list items display correctly
- [ ] Status badges show correct colors:
  - [ ] Confirmed (green)
  - [ ] Declined (red)
  - [ ] Maybe (yellow)
  - [ ] Invited (blue)
- [ ] Remove buttons show on hover
- [ ] Remove button background changes on hover

#### Resources Section

- [ ] Resource cards display correctly
- [ ] Progress bars show with gradient fill
- [ ] "Add Resource" button is indigo
- [ ] Contribution form displays properly
- [ ] All buttons have correct colors

---

### Modals

#### Create Event Modal

- [ ] Modal overlay is semi-transparent with blur
- [ ] Modal content is centered and rounded
- [ ] Close button (×) works and has hover effect
- [ ] Form inputs have consistent styling
- [ ] Input focus states work (blue border + shadow)
- [ ] Cancel button is gray
- [ ] Submit button has gradient
- [ ] Button hover effects work
- [ ] Form actions are right-aligned on desktop
- [ ] Form actions stack on mobile

#### Delete Confirmation Modal

- [ ] Modal displays with proper styling
- [ ] Warning box shows with red background
- [ ] Cancel button is gray
- [ ] Delete button is red
- [ ] Hover effects work
- [ ] Animation slides up smoothly

---

## Responsive Testing

### Desktop (>1200px)

- [ ] All content is within max-width container
- [ ] Spacing is comfortable
- [ ] Event grid shows 3-4 columns

### Tablet (768px - 1200px)

- [ ] Event grid shows 2-3 columns
- [ ] Navigation is usable
- [ ] Forms are comfortable width

### Mobile (<768px)

- [ ] Event grid shows 1 column
- [ ] User greeting hides in header
- [ ] Form actions stack vertically
- [ ] Modal margins are smaller
- [ ] Touch targets are large enough
- [ ] Buttons are full width where appropriate

---

## Interactive State Testing

### Buttons

- [ ] Default state displays correctly
- [ ] Hover state changes appearance
- [ ] Active state responds to click
- [ ] Disabled state is grayed out
- [ ] Disabled state prevents interaction
- [ ] Focus state shows outline (keyboard navigation)

### Form Inputs

- [ ] Default state has light border
- [ ] Focus state has blue border + shadow
- [ ] Error state has red border
- [ ] Disabled state is grayed out
- [ ] Placeholder text is gray and readable

### Cards/Interactive Elements

- [ ] Hover states work smoothly
- [ ] Transitions are not too fast or slow (~0.2s)
- [ ] Shadow changes are visible
- [ ] Transform effects work (lift/scale)

---

## Animation Testing

### Modal Animations

- [ ] Modal slides up when opening
- [ ] Modal fades in smoothly
- [ ] No lag or jank

### Hover Animations

- [ ] Button lifts are smooth
- [ ] Shadow transitions are smooth
- [ ] Color transitions are smooth
- [ ] No flickering

### Reduced Motion

- [ ] Test with system "Reduce Motion" enabled
- [ ] Animations should be near-instant or disabled

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Console/Error Checking

### No Console Errors

- [ ] No CSS import errors
- [ ] No missing variable warnings
- [ ] No layout shift warnings
- [ ] No accessibility warnings

### DevTools CSS Inspection

- [ ] Variables show correct values in inspector
- [ ] Computed styles use variable values
- [ ] No overridden/crossed-out critical styles

---

## Accessibility Testing

### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Focus indicators are visible
- [ ] Focus order is logical
- [ ] Enter/Space activates buttons

### Screen Reader (Optional)

- [ ] Content is announced properly
- [ ] Form labels are associated
- [ ] Buttons have clear labels

### Color Contrast

- [ ] Text is readable on all backgrounds
- [ ] Status badges have sufficient contrast
- [ ] Links are distinguishable

---

## Performance Checks

### Initial Load

- [ ] Page loads quickly
- [ ] No flash of unstyled content (FOUC)
- [ ] Styles apply immediately

### Interaction Performance

- [ ] Hover effects are instant
- [ ] No lag when opening modals
- [ ] Scrolling is smooth

---

## Edge Cases

### Long Content

- [ ] Long event names wrap properly
- [ ] Long user emails don't break layout
- [ ] Long resource names are contained

### Empty States

- [ ] "No events" message displays correctly
- [ ] "No participants" message displays correctly
- [ ] "No contributions" message displays correctly

### Error States

- [ ] Error messages are visible and readable
- [ ] Form validation errors display properly
- [ ] Toast notifications display correctly

---

## Final Verification

### Visual Consistency

- [ ] All primary buttons look the same
- [ ] All secondary buttons look the same
- [ ] All cards use consistent shadows
- [ ] All inputs use consistent styling
- [ ] All modals use consistent styling

### Token Usage Verification

- [ ] Open DevTools → Elements
- [ ] Inspect any styled element
- [ ] Check Computed styles
- [ ] Verify CSS variables are being used
- [ ] Example: Should see `var(--color-primary)` not `#667eea`

---

## Sign-Off

When all items are checked:

- [ ] No visual regressions found
- [ ] All interactions work smoothly
- [ ] Responsive design works at all breakpoints
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Accessibility is maintained

**Refactoring Status: Ready for Production** ✅

---

## If Issues Found

Document any issues using this format:

```
Issue: [Brief description]
Location: [Page/Component]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1. [Step 1]
2. [Step 2]
Expected: [What should happen]
Actual: [What actually happens]
Screenshot: [If applicable]
```

---

## Quick Fix Reference

Common issues and solutions:

### Issue: Variables not working

**Solution**: Check if `@/core/styles/index.css` is imported in main.tsx

### Issue: Colors look wrong

**Solution**: Check token values in `src/core/styles/tokens/colors.css`

### Issue: Spacing looks off

**Solution**: Verify spacing token values in `tokens/spacing.css`

### Issue: Hover effects not working

**Solution**: Check transition values in `tokens/transitions.css`

### Issue: Shadows not visible

**Solution**: Check shadow values in `tokens/shadows.css`

---

**Happy Testing!** 🎨✨
