# 🏗️ HappyRow Front - Feature-Driven Architecture

This document describes the feature-driven architecture implemented in the HappyRow Front application.

## 📁 Project Structure

```bash
src/
├── core/                 # Global configuration, shared utilities
│   ├── config/           # App-wide configuration
│   │   ├── api.ts        # API configuration
│   │   └── supabase.ts   # Supabase configuration
│   └── styles/           # Global styles
│       ├── index.css     # Base styles
│       └── app.css       # App-wide styles
│
├── shared/               # Shared components across features
│   └── components/
│       └── Modal/        # Generic modal component
│           ├── Modal.tsx
│           ├── Modal.css
│           └── index.ts
│
├── features/             # Feature-based modules
│   ├── auth/             # Authentication feature
│   │   ├── components/   # Auth-specific components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   └── index.ts
│   │   ├── hooks/        # Auth hooks
│   │   │   ├── useAuthContext.tsx
│   │   │   ├── useAuthActions.ts
│   │   │   └── index.ts
│   │   ├── services/     # Auth services (repositories)
│   │   │   ├── SupabaseAuthRepository.ts
│   │   │   ├── AuthServiceFactory.ts
│   │   │   └── index.ts
│   │   ├── types/        # Auth types and interfaces
│   │   │   ├── User.ts
│   │   │   ├── AuthRepository.ts
│   │   │   └── index.ts
│   │   ├── use-cases/    # Auth business logic
│   │   │   ├── RegisterUser.ts
│   │   │   ├── SignInUser.ts
│   │   │   ├── SignOutUser.ts
│   │   │   ├── GetCurrentUser.ts
│   │   │   ├── ResetPassword.ts
│   │   │   └── index.ts
│   │   ├── views/        # Auth screens/views
│   │   │   ├── AuthView.tsx
│   │   │   ├── AuthView.css
│   │   │   └── index.ts
│   │   └── index.ts      # Feature barrel export
│   │
│   ├── events/           # Events feature
│   │   ├── components/
│   │   │   ├── CreateEventForm.tsx
│   │   │   ├── CreateEventForm.css
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── HttpEventRepository.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── Event.ts
│   │   │   ├── EventRepository.ts
│   │   │   └── index.ts
│   │   ├── use-cases/
│   │   │   ├── CreateEvent.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── home/             # Home/Dashboard feature
│       ├── views/
│       │   ├── HomeView.tsx
│       │   ├── HomeView.css
│       │   └── index.ts
│       └── index.ts
│
├── layouts/              # App-wide layouts
│   ├── AppHeader/        # Header layout component
│   │   ├── AppHeader.tsx
│   │   ├── AppHeader.css
│   │   └── index.ts
│   ├── AppLayout/        # Main app layout
│   │   ├── AppLayout.tsx
│   │   ├── AppLayout.css
│   │   └── index.ts
│   └── index.ts
│
├── App.tsx               # Root app component
├── main.tsx              # App entry point
└── vite-env.d.ts         # Vite type definitions
```

---

## 🎯 Architecture Principles

### 1. **Feature-Based Organization**

Each feature is self-contained with all its dependencies:

- **components/** - UI components specific to the feature
- **hooks/** - React hooks for the feature
- **services/** - Data fetching and external integrations
- **types/** - TypeScript interfaces and types
- **use-cases/** - Business logic and validation
- **views/** - Main screens/pages for the feature

### 2. **Clear Separation of Concerns**

- **Types**: Define contracts and data structures
- **Services**: Handle external communication (APIs, databases)
- **Use Cases**: Implement business logic and validation
- **Components**: Reusable UI elements
- **Views**: Compose components into complete screens
- **Hooks**: Encapsulate stateful logic

### 3. **Path Aliases**

Using `@/` prefix for clean imports:

```typescript
import { User } from '@/features/auth/types';
import { Modal } from '@/shared/components/Modal';
import { apiConfig } from '@/core/config/api';
```

---

## 📦 Feature Structure Example

### Auth Feature

```
features/auth/
├── components/        # Form components (Login, Register, etc.)
├── hooks/             # useAuth, useAuthActions
├── services/          # SupabaseAuthRepository, AuthServiceFactory
├── types/             # User, AuthSession, AuthRepository interfaces
├── use-cases/         # RegisterUser, SignInUser, etc.
├── views/             # AuthView (main auth screen)
└── index.ts           # Barrel exports
```

**Usage:**

```tsx
import { AuthView, AuthProvider, useAuth } from '@/features/auth';
import type { User, AuthRepository } from '@/features/auth/types';
```

---

## 🔄 Data Flow

```
View/Component
    ↓ (user action)
Hook (useAuthActions)
    ↓ (calls)
Use Case (RegisterUser, SignInUser)
    ↓ (validates & calls)
Service (SupabaseAuthRepository)
    ↓ (communicates with)
External API (Supabase, Backend)
```

---

## 🧩 Shared Resources

### Core

Global configuration and utilities used across all features:

- API configuration
- Supabase setup
- Global styles

### Shared Components

Reusable UI components that multiple features use:

- Modal
- Buttons
- Form inputs
- etc.

### Layouts

App-wide layout components:

- AppHeader (navigation bar)
- AppLayout (main layout wrapper)

---

## ✨ Benefits

1. **Scalability**: Easy to add new features without affecting existing ones
2. **Maintainability**: Related code is co-located, easier to find and modify
3. **Reusability**: Clear distinction between feature-specific and shared code
4. **Testability**: Each feature can be tested in isolation
5. **Team Collaboration**: Multiple developers can work on different features simultaneously
6. **Code Ownership**: Clear boundaries for feature ownership

---

## 🚀 Adding a New Feature

To add a new feature (e.g., "profile"):

1. Create feature directory:

```bash
src/features/profile/
├── components/
├── hooks/
├── services/
├── types/
├── use-cases/
├── views/
└── index.ts
```

2. Define types and interfaces
3. Implement services for data fetching
4. Create use cases for business logic
5. Build components and views
6. Export from index.ts
7. Use in your app!

---

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Supabase** - Authentication & database
- **React Router** (optional) - Routing

---

## 📝 Migration from Clean Architecture

The project was refactored from a traditional clean architecture (domain/application/infrastructure/presentation) to a feature-driven architecture for better scalability and maintainability.

**Old Structure:**

```
src/
├── domain/           # All entity definitions
├── application/      # All use cases
├── infrastructure/   # All repositories
└── presentation/     # All UI components
```

**New Structure:**

```
src/
├── features/
│   ├── auth/         # Everything auth-related
│   ├── events/       # Everything events-related
│   └── home/         # Everything home-related
├── shared/           # Shared components
└── core/             # Global config
```

**Benefits of Migration:**

- Related code is now co-located
- Features can be developed independently
- Easier onboarding for new developers
- Clearer code ownership
- Better scalability

---

## 📚 Resources

- [Feature-Driven Development](https://en.wikipedia.org/wiki/Feature-driven_development)
- [React Project Structure](https://reactjs.org/docs/faq-structure.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
