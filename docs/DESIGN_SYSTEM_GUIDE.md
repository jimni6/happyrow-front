# Design System Quick Reference Guide

## Using Design Tokens in Your CSS

### Colors

#### Primary Colors

```css
.my-component {
  color: var(--color-primary);
  background: var(--bg-gradient);
}
```

#### Semantic Colors

```css
.error {
  color: var(--color-danger);
}
.success {
  color: var(--color-success);
}
.warning {
  color: var(--color-warning);
}
.info {
  color: var(--color-info);
}
```

#### Gray Scale

```css
.text-dark {
  color: var(--color-gray-900);
}
.text-medium {
  color: var(--color-gray-600);
}
.text-light {
  color: var(--color-gray-400);
}
.bg-light {
  background: var(--color-gray-50);
}
```

### Spacing

#### Standard Spacing

```css
.component {
  padding: var(--space-3); /* 16px */
  margin-bottom: var(--space-4); /* 24px */
  gap: var(--space-2); /* 12px */
}
```

#### Common Patterns

```css
.button {
  padding: var(--space-2) var(--space-4); /* 12px 24px */
}

.card {
  padding: var(--space-5); /* 32px */
}
```

### Typography

#### Font Sizes

```css
.small-text {
  font-size: var(--text-sm);
} /* 14px */
.normal-text {
  font-size: var(--text-base);
} /* 16px */
.heading {
  font-size: var(--text-2xl);
} /* 24px */
.large-heading {
  font-size: var(--text-4xl);
} /* 36px */
```

#### Font Weights

```css
.light {
  font-weight: var(--font-normal);
} /* 400 */
.medium {
  font-weight: var(--font-medium);
} /* 500 */
.bold {
  font-weight: var(--font-semibold);
} /* 600 */
.bolder {
  font-weight: var(--font-bold);
} /* 700 */
```

### Shadows

#### Elevation

```css
.card-subtle {
  box-shadow: var(--shadow-sm);
}
.card-normal {
  box-shadow: var(--shadow-md);
}
.card-elevated {
  box-shadow: var(--shadow-lg);
}
.modal {
  box-shadow: var(--shadow-3xl);
}
```

#### Colored Shadows

```css
.button-primary:hover {
  box-shadow: var(--shadow-primary);
}

.button-danger:hover {
  box-shadow: var(--shadow-danger);
}
```

### Borders

#### Border Radius

```css
.slightly-rounded {
  border-radius: var(--radius-sm);
} /* 4px */
.rounded {
  border-radius: var(--radius-md);
} /* 6px */
.very-rounded {
  border-radius: var(--radius-lg);
} /* 8px */
.extra-rounded {
  border-radius: var(--radius-xl);
} /* 12px */
.circle {
  border-radius: var(--radius-full);
} /* 50% */
.pill {
  border-radius: var(--radius-pill);
} /* 9999px */
```

#### Border Styles

```css
.bordered {
  border: var(--border-light-normal); /* 2px solid #e9ecef */
}

.input:focus {
  border-color: var(--border-focus);
}

.input.error {
  border-color: var(--border-error);
}
```

### Transitions

#### Standard Transitions

```css
.button {
  transition: var(--transition-all); /* all 0.2s ease-in-out */
}

.link {
  transition: var(--transition-colors); /* colors only */
}

.animated {
  transition: var(--transition-transform); /* transform only */
}
```

#### Custom Transitions

```css
.custom {
  transition: background-color var(--duration-normal) var(--ease-out);
}
```

## Common Component Patterns

### Button Pattern

```css
.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-all);
}

.button-primary {
  background: var(--bg-gradient);
  color: var(--color-text-white);
  box-shadow: var(--shadow-primary);
}

.button-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-primary-lg);
}

.button:disabled {
  opacity: var(--state-disabled-opacity);
  cursor: not-allowed;
}
```

### Card Pattern

```css
.card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-md);
  transition: var(--transition-shadow);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

### Form Input Pattern

```css
.input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: var(--border-light-normal);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  transition: var(--transition-all);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: var(--shadow-focus);
}

.input:disabled {
  background: var(--state-disabled-bg);
  cursor: not-allowed;
  opacity: var(--state-disabled-opacity);
}

.input.error {
  border-color: var(--border-error);
}
```

### Modal Pattern

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-3xl);
  max-width: 500px;
  width: 90%;
}
```

## Utility Classes

### Display

```html
<div class="flex items-center justify-between gap-md">
  <!-- Content -->
</div>
```

### Text

```html
<p class="text-center text-lg font-semibold">Centered, large, semi-bold text</p>
```

### Spacing

```html
<div class="m-0 p-0">No margin or padding</div>
<div class="mx-auto">Centered horizontally</div>
```

### Shadows

```html
<div class="shadow-md">Medium shadow</div>
```

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
.component {
  padding: var(--space-3);
}

@media (max-width: 768px) {
  .component {
    padding: var(--space-2);
  }
}

@media (max-width: 480px) {
  .component {
    padding: var(--space-1);
  }
}
```

## Accessibility

### Focus States

```css
.interactive:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Reduced Motion

All animations respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Best Practices

1. **Always use tokens** instead of hardcoded values
2. **Use semantic naming** (e.g., `--color-danger` not `--color-red`)
3. **Follow spacing scale** (8px increments)
4. **Use consistent transitions** (var(--transition-all))
5. **Apply proper focus states** for accessibility
6. **Use utility classes** for common patterns
7. **Keep component styles colocated** with components
8. **Test responsive design** at all breakpoints

## Dark Mode (Future)

When implementing dark mode, override tokens:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --color-text-primary: #f0f0f0;
    --color-gray-50: #2a2a2a;
    --color-gray-900: #f5f5f5;
    /* Invert gray scale and adjust colors */
  }
}
```

## Examples

### Before (Hardcoded)

```css
.button {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.2s ease;
}
```

### After (Using Tokens)

```css
.button {
  padding: var(--space-2) var(--space-5);
  background: var(--bg-gradient);
  color: var(--color-text-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-primary);
  transition: var(--transition-all);
}
```

## Need Help?

- Check `src/core/styles/tokens/` for available variables
- Reference `CSS_REFACTORING_SUMMARY.md` for full documentation
- Look at existing component CSS files for patterns
- All tokens include comments explaining their use
