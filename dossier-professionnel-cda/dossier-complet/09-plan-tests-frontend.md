# 9. PLAN DE TESTS FRONTEND (React/TypeScript)

## 9.1 Stratégie de tests frontend

### 9.1.1 Pyramide des tests appliquée au frontend

```
              ┌─────────────┐
              │  Tests E2E  │  (10%)
              │  (Manuels)  │
              └─────────────┘
           ┌─────────────────────┐
           │  Tests d'intégration │  (20%)
           │  (Composants + API)  │
           └─────────────────────┘
      ┌──────────────────────────────┐
      │      Tests unitaires          │  (70%)
      │  (Use Cases, Components)      │
      └──────────────────────────────┘
```

**Justification** :

- **70% Tests unitaires** : Validation des Use Cases, composants isolés, hooks
- **20% Tests d'intégration** : Composants + Context, interactions utilisateur
- **10% Tests E2E** : Tests manuels (Selenium/Playwright prévu pour v2)

### 9.1.2 Outils de tests

| Outil                           | Version | Usage                                           |
| ------------------------------- | ------- | ----------------------------------------------- |
| **Vitest**                      | 3.2.4   | Framework de tests (compatible Vite)            |
| **React Testing Library**       | 16.3.0  | Tests composants React orientés utilisateur     |
| **@testing-library/user-event** | 14.6.1  | Simulation d'interactions utilisateur réalistes |
| **@testing-library/jest-dom**   | 6.4.2   | Matchers custom pour le DOM                     |
| **jsdom**                       | 27.0.0  | Environnement DOM pour Node.js                  |

---

## 9.2 Tests unitaires frontend

### 9.2.1 Tests des Use Cases TypeScript

**Objectif** : Valider la logique métier côté client

**Exemple - Test CreateEvent Use Case** :

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CreateEvent } from '@/features/events/use-cases/CreateEvent';
import type { EventRepository } from '@/features/events/types/EventRepository';
import { EventType } from '@/features/events/types/Event';

describe('CreateEvent Use Case', () => {
  it('should create an event with valid data', async () => {
    // Arrange
    const mockRepository: EventRepository = {
      create: vi.fn().mockResolvedValue({
        id: '123',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2026-12-25'),
        location: 'Paris',
        type: EventType.PARTY,
        organizerId: 'user-123',
      }),
    };

    const useCase = new CreateEvent(mockRepository);

    // Act
    const result = await useCase.execute({
      name: 'Test Event',
      description: 'Test Description',
      date: new Date('2026-12-25'),
      location: 'Paris',
      type: EventType.PARTY,
      organizerId: 'user-123',
    });

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe('Test Event');
    expect(mockRepository.create).toHaveBeenCalledOnce();
  });

  it('should throw error if date is in the past', async () => {
    const mockRepository: EventRepository = {
      create: vi.fn(),
    };

    const useCase = new CreateEvent(mockRepository);

    // Act & Assert
    await expect(
      useCase.execute({
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2020-01-01'), // Date passée
        location: 'Paris',
        type: EventType.PARTY,
        organizerId: 'user-123',
      })
    ).rejects.toThrow('Event date must be in the future');

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should validate event name length', async () => {
    const mockRepository: EventRepository = {
      create: vi.fn(),
    };

    const useCase = new CreateEvent(mockRepository);

    await expect(
      useCase.execute({
        name: 'ab', // Trop court
        description: 'Test Description',
        date: new Date('2026-12-25'),
        location: 'Paris',
        type: EventType.PARTY,
        organizerId: 'user-123',
      })
    ).rejects.toThrow('Event name must be at least 3 characters');
  });
});
```

**Couverture** :

- ✅ Cas nominal (succès)
- ✅ Validation des dates
- ✅ Validation des champs
- ✅ Gestion des erreurs

---

### 9.2.2 Tests des composants React

**Objectif** : Valider le rendu et le comportement des composants UI

**Exemple - Test CreateEventForm** :

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateEventForm } from '@/features/events/components/CreateEventForm';
import { EventType } from '@/features/events/types/Event';

describe('CreateEventForm Component', () => {
  it('should render all form fields', () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<CreateEventForm onSubmit={onSubmit} onCancel={onCancel} />);

    expect(screen.getByLabelText(/event name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/event type/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<CreateEventForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Tenter de soumettre sans remplir
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    // Vérifier les messages d'erreur
    await waitFor(() => {
      expect(
        screen.getByText(/event name must be at least 3 characters/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/description must be at least 3 characters/i)
      ).toBeInTheDocument();
    });

    // onSubmit ne doit pas être appelé
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    render(<CreateEventForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Remplir le formulaire
    await user.type(
      screen.getByLabelText(/event name/i),
      'Test Event'
    );
    await user.type(
      screen.getByLabelText(/description/i),
      'Test Description'
    );
    await user.type(
      screen.getByLabelText(/event date/i),
      '2026-12-25'
    );
    await user.type(
      screen.getByLabelText(/event time/i),
      '19:00'
    );
    await user.type(
      screen.getByLabelText(/location/i),
      'Paris'
    );
    await user.selectOptions(
      screen.getByLabelText(/event type/i),
      EventType.PARTY
    );

    // Soumettre
    const submitButton = screen.getByRole('button', { name: /create event/i });
    await user.click(submitButton);

    // Vérifier l'appel à onSubmit
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Test Event',
        description: 'Test Description',
        date: expect.any(Date),
        location: 'Paris',
        type: EventType.PARTY,
      });
    });
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<CreateEventForm onSubmit={onSubmit} onCancel={onCancel} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should disable form during submission', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );
    const onCancel = vi.fn();

    render(
      <CreateEventForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        isLoading={true}
      />
    );

    // Tous les inputs doivent être désactivés
    expect(screen.getByLabelText(/event name/i)).toBeDisabled();
    expect(screen.getByLabelText(/description/i)).toBeDisabled();
    expect(screen.getByLabelText(/location/i)).toBeDisabled();

    // Le bouton doit afficher "Creating..."
    expect(screen.getByText(/creating.../i)).toBeInTheDocument();
  });
});
```

**Couverture** :

- ✅ Rendu des champs
- ✅ Validation côté client
- ✅ Soumission avec données valides
- ✅ États de chargement
- ✅ Interactions utilisateur (click, type, select)

---

### 9.2.3 Tests des Hooks personnalisés

**Exemple - Test useAuth Hook** :

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/features/auth/hooks/useAuthContext';
import type { AuthRepository } from '@/features/auth/types/AuthRepository';

describe('useAuth Hook', () => {
  it('should provide authentication context', async () => {
    const mockRepository: AuthRepository = {
      getCurrentUser: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
        session: {
          accessToken: 'token-123',
          refreshToken: 'refresh-123',
        },
      }),
      onAuthStateChange: vi.fn(() => () => {}),
    };

    const wrapper = ({ children }) => (
      <AuthProvider authRepository={mockRepository}>
        {children}
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Initialement loading
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();

    // Après chargement
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');
  });
});
```

---

## 9.3 Tests d'intégration frontend

### 9.3.1 Tests avec Context + Composants

**Objectif** : Valider l'interaction entre composants et contexte d'authentification

**Exemple - Test AuthScreen avec Context** :

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth';
import { AuthView } from '@/features/auth';

describe('AuthScreen Integration', () => {
  it('should switch between login and register forms', async () => {
    const user = userEvent.setup();
    const mockRepository = createMockAuthRepository();

    render(
      <AuthProvider authRepository={mockRepository}>
        <AuthView authRepository={mockRepository} />
      </AuthProvider>
    );

    // Initialement sur le formulaire de connexion
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();

    // Cliquer sur "Create account"
    const createAccountLink = screen.getByText(/create account/i);
    await user.click(createAccountLink);

    // Passer au formulaire d'inscription
    await waitFor(() => {
      expect(screen.getByText(/create your account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/firstname/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/lastname/i)).toBeInTheDocument();
    });
  });

  it('should authenticate user and update context', async () => {
    const user = userEvent.setup();
    const mockRepository = {
      signIn: vi.fn().mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
        session: {
          accessToken: 'token-123',
        },
      }),
      getCurrentUser: vi.fn(),
      onAuthStateChange: vi.fn(() => () => {}),
    };

    const { rerender } = render(
      <AuthProvider authRepository={mockRepository}>
        <AuthView authRepository={mockRepository} />
      </AuthProvider>
    );

    // Remplir le formulaire de connexion
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Soumettre
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    // Vérifier que signIn a été appelé
    await waitFor(() => {
      expect(mockRepository.signIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

---

## 9.4 Configuration Vitest

**Fichier** : `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types/',
        '**/__tests__/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Fichier** : `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup après chaque test
afterEach(() => {
  cleanup();
});
```

---

## 9.5 Commandes et CI/CD

### 9.5.1 Scripts NPM

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  }
}
```

### 9.5.2 Intégration GitHub Actions

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:run

      - name: Generate coverage
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Conclusion de la section 9

Le plan de tests frontend démontre une approche professionnelle avec :

✅ **Pyramide des tests** respectée (70/20/10)  
✅ **Tests unitaires** pour Use Cases et composants  
✅ **Tests d'intégration** avec Context API  
✅ **Outils modernes** (Vitest, React Testing Library)  
✅ **CI/CD intégré** avec GitHub Actions  
✅ **Couverture ciblée** (≥80%)

**Compétences CDA démontrées** :

- **CDA-3.1** : Préparer et exécuter les plans de tests

**Section suivante** : Jeu d'essai frontend détaillé.
