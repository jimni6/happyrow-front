# 🔄 Migration Guide: Clean Architecture → Feature-Driven Architecture

This guide helps you understand the changes made during the refactoring from clean architecture to feature-driven architecture.

## 📋 Overview

The project was restructured to improve scalability, maintainability, and developer experience by organizing code around features rather than architectural layers.

---

## 🗺️ File Mapping

### Configuration Files

| Old Path                 | New Path                      |
| ------------------------ | ----------------------------- |
| `src/config/api.ts`      | `src/core/config/api.ts`      |
| `src/config/supabase.ts` | `src/core/config/supabase.ts` |
| `src/index.css`          | `src/core/styles/index.css`   |
| `src/App.css`            | `src/core/styles/app.css`     |

### Auth Feature

| Old Path                                             | New Path                                               |
| ---------------------------------------------------- | ------------------------------------------------------ |
| `src/domain/User.ts`                                 | `src/features/auth/types/User.ts`                      |
| `src/domain/AuthRepository.ts`                       | `src/features/auth/types/AuthRepository.ts`            |
| `src/application/RegisterUser.ts`                    | `src/features/auth/use-cases/RegisterUser.ts`          |
| `src/application/SignInUser.ts`                      | `src/features/auth/use-cases/SignInUser.ts`            |
| `src/application/SignOutUser.ts`                     | `src/features/auth/use-cases/SignOutUser.ts`           |
| `src/application/GetCurrentUser.ts`                  | `src/features/auth/use-cases/GetCurrentUser.ts`        |
| `src/application/ResetPassword.ts`                   | `src/features/auth/use-cases/ResetPassword.ts`         |
| `src/infrastructure/SupabaseAuthRepository.ts`       | `src/features/auth/services/SupabaseAuthRepository.ts` |
| `src/infrastructure/AuthServiceFactory.ts`           | `src/features/auth/services/AuthServiceFactory.ts`     |
| `src/presentation/contexts/AuthContext.tsx`          | `src/features/auth/hooks/useAuthContext.tsx`           |
| `src/presentation/hooks/useAuthActions.ts`           | `src/features/auth/hooks/useAuthActions.ts`            |
| `src/presentation/components/LoginForm.tsx`          | `src/features/auth/components/LoginForm.tsx`           |
| `src/presentation/components/RegisterForm.tsx`       | `src/features/auth/components/RegisterForm.tsx`        |
| `src/presentation/components/ForgotPasswordForm.tsx` | `src/features/auth/components/ForgotPasswordForm.tsx`  |
| `src/presentation/screens/AuthScreen.tsx`            | `src/features/auth/views/AuthView.tsx`                 |
| `src/presentation/styles/Auth.css`                   | `src/features/auth/views/AuthView.css`                 |

### Events Feature

| Old Path                                          | New Path                                              |
| ------------------------------------------------- | ----------------------------------------------------- |
| `src/domain/Event.ts`                             | `src/features/events/types/Event.ts`                  |
| `src/domain/EventRepository.ts`                   | `src/features/events/types/EventRepository.ts`        |
| `src/application/CreateEvent.ts`                  | `src/features/events/use-cases/CreateEvent.ts`        |
| `src/infrastructure/HttpEventRepository.ts`       | `src/features/events/services/HttpEventRepository.ts` |
| `src/presentation/components/CreateEventForm.tsx` | `src/features/events/components/CreateEventForm.tsx`  |
| `src/presentation/components/CreateEventForm.css` | `src/features/events/components/CreateEventForm.css`  |

### Home Feature

| Old Path                                  | New Path                               |
| ----------------------------------------- | -------------------------------------- |
| `src/presentation/screens/HomeScreen.tsx` | `src/features/home/views/HomeView.tsx` |
| `src/presentation/screens/HomeScreen.css` | `src/features/home/views/HomeView.css` |

### Shared Components

| Old Path                                | New Path                                |
| --------------------------------------- | --------------------------------------- |
| `src/presentation/components/Modal.tsx` | `src/shared/components/Modal/Modal.tsx` |
| `src/presentation/components/Modal.css` | `src/shared/components/Modal/Modal.css` |

### Layouts

| Component                          | New Path                              |
| ---------------------------------- | ------------------------------------- |
| AppHeader (extracted from App.tsx) | `src/layouts/AppHeader/AppHeader.tsx` |
| AppLayout (new)                    | `src/layouts/AppLayout/AppLayout.tsx` |

---

## 🔧 Import Updates

### Before (Old Imports)

```typescript
// Domain imports
import type { User } from './domain/User';
import type { AuthRepository } from './domain/AuthRepository';

// Application imports
import { RegisterUser } from './application/RegisterUser';
import { SignInUser } from './application/SignInUser';

// Infrastructure imports
import { SupabaseAuthRepository } from './infrastructure/SupabaseAuthRepository';
import { AuthServiceFactory } from './infrastructure/AuthServiceFactory';

// Presentation imports
import { AuthProvider, useAuth } from './presentation/contexts/AuthContext';
import { useAuthActions } from './presentation/hooks/useAuthActions';
import { LoginForm } from './presentation/components/LoginForm';
import { AuthScreen } from './presentation/screens/AuthScreen';

// Config imports
import { apiConfig } from './config/api';
import { supabaseConfig } from './config/supabase';
```

### After (New Imports with Path Aliases)

```typescript
// Feature imports (all auth-related from one place)
import { AuthProvider, useAuth, useAuthActions } from '@/features/auth/hooks';
import { LoginForm, RegisterForm } from '@/features/auth/components';
import { AuthView } from '@/features/auth/views';
import { AuthServiceFactory } from '@/features/auth/services';
import type { User, AuthRepository } from '@/features/auth/types';

// Or use the feature barrel export
import {
  AuthProvider,
  useAuth,
  useAuthActions,
  LoginForm,
  AuthView,
  AuthServiceFactory,
} from '@/features/auth';
import type { User, AuthRepository } from '@/features/auth/types';

// Core imports
import { apiConfig } from '@/core/config/api';
import { supabaseConfig } from '@/core/config/supabase';

// Shared imports
import { Modal } from '@/shared/components/Modal';

// Layout imports
import { AppLayout, AppHeader } from '@/layouts';
```

---

## 🎯 Key Changes

### 1. Path Aliases Configuration

**tsconfig.json:**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**vite.config.ts:**

```typescript
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 2. Feature Barrel Exports

Each feature now has an `index.ts` file that exports all public APIs:

**src/features/auth/index.ts:**

```typescript
// Types
export type {
  User,
  UserCredentials,
  UserRegistration,
  AuthSession,
  AuthRepository,
} from './types';

// Services
export { SupabaseAuthRepository, AuthServiceFactory } from './services';

// Hooks
export { AuthProvider, useAuth, useAuthActions } from './hooks';

// Components
export { LoginForm, RegisterForm, ForgotPasswordForm } from './components';

// Views
export { AuthView } from './views';

// Use Cases
export {
  RegisterUser,
  SignInUser,
  SignOutUser,
  GetCurrentUser,
  ResetPassword,
} from './use-cases';
```

### 3. Component Renaming

For consistency with feature-driven naming:

- `AuthScreen` → `AuthView`
- `HomeScreen` → `HomeView`

### 4. Layout Extraction

The AppHeader component was extracted from App.tsx into a dedicated layout:

- `src/layouts/AppHeader/AppHeader.tsx`
- `src/layouts/AppLayout/AppLayout.tsx`

---

## 🧪 Testing Updates

Test files should be updated to use the new import paths:

### Before

```typescript
import { SupabaseAuthRepository } from '../infrastructure/SupabaseAuthRepository';
import type { User } from '../domain/User';
```

### After

```typescript
import { SupabaseAuthRepository } from '@/features/auth/services';
import type { User } from '@/features/auth/types';
```

---

## ✅ Migration Checklist

- [x] Create new feature-based directory structure
- [x] Migrate auth feature files
- [x] Migrate events feature files
- [x] Migrate home feature files
- [x] Create core directory with config
- [x] Create shared components directory
- [x] Create layouts directory
- [x] Update App.tsx with new imports
- [x] Update main.tsx with new imports
- [x] Configure path aliases in tsconfig.json
- [x] Configure path aliases in vite.config.ts
- [ ] Update test files with new imports
- [ ] Run tests to verify everything works
- [ ] Delete old directories (domain, application, infrastructure, presentation)
- [ ] Update documentation

---

## 🚀 Next Steps

1. **Test the Application:**

   ```bash
   npm run dev
   ```

2. **Run Tests:**

   ```bash
   npm run test
   ```

3. **Update Test Imports:**
   Update all test files to use the new paths and ensure all tests pass.

4. **Clean Up Old Files:**
   Once you've verified everything works, you can safely delete the old directories:

   ```bash
   # Backup first!
   rm -rf src/domain
   rm -rf src/application
   rm -rf src/infrastructure
   rm -rf src/presentation
   rm -rf src/config
   rm src/index.css
   rm src/App.css
   ```

5. **Update CI/CD:**
   Ensure your CI/CD pipelines work with the new structure.

---

## 🐛 Troubleshooting

### Import Errors

If you see import errors, verify:

1. Path aliases are configured in `tsconfig.json` and `vite.config.ts`
2. Your IDE has reloaded the TypeScript configuration
3. You're using the `@/` prefix for absolute imports

### Module Not Found

If modules aren't found:

1. Check the file actually exists in the new location
2. Verify the barrel export (`index.ts`) includes the export
3. Restart your dev server

### Type Errors

If you encounter type errors:

1. Ensure all type imports use the new paths
2. Check that interfaces haven't changed during migration
3. Run `tsc --noEmit` to see all type errors

---

## 📞 Support

If you encounter issues during migration:

1. Check the `ARCHITECTURE.md` file for structure details
2. Review this migration guide
3. Compare with the example in the README
4. Check Git history to see what changed

---

## 🎉 Congratulations!

You've successfully migrated to a feature-driven architecture! Your codebase is now more scalable, maintainable, and easier to navigate.
