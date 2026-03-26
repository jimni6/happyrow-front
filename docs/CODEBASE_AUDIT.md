# 🔍 Audit Complet du Codebase — happyrow-front

> **Date** : 24 mars 2025
> **Scope** : Architecture, Code Smells, Incohérences, Sécurité, Tests, Dépendances, DevOps

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Architecture & Structure](#2-architecture--structure)
3. [Code Smells & Incohérences](#3-code-smells--incohérences)
4. [Sécurité](#4-sécurité)
5. [Tests](#5-tests)
6. [Dépendances & Configuration](#6-dépendances--configuration)
7. [DevOps & CI/CD](#7-devops--cicd)
8. [Plan d'amélioration priorisé](#8-plan-damélioration-priorisé)

---

## 1. Résumé exécutif

| Catégorie        | Sévérité            | Nombre de problèmes |
| ---------------- | ------------------- | ------------------- |
| **Sécurité**     | 🔴 Critique / Haute | 7                   |
| **Code Smells**  | 🟠 Moyenne          | 14                  |
| **Incohérences** | 🟡 Basse            | 10                  |
| **Tests**        | 🟠 Moyenne          | 4                   |
| **DevOps**       | 🟡 Basse            | 3                   |

L'architecture globale (clean architecture par feature) est solide. Les problèmes principaux sont :

- Des **failles de sécurité** dans la CSP, les headers CORS, et la gestion des tokens
- Du **code dupliqué massif** entre `HomePage` et `HomeView`
- Des **fichiers orphelins** et artefacts de dev oubliés
- Des **instanciations de repositories répétées** qui cassent le pattern d'injection de dépendances
- Une **couverture de tests insuffisante** en dehors du module auth

---

## 2. Architecture & Structure

### 2.1 Points positifs ✅

- **Feature-based structure** bien respectée : `auth`, `events`, `contributions`, `resources`, `participants`, `home`, `user`, `welcome`
- **Clean architecture** par feature : `types/` → `use-cases/` → `services/` → `hooks/` → `components/` → `views/`
- **Barrel exports** (`index.ts`) dans chaque feature pour encapsuler les dépendances internes
- **Séparation des préoccupations** : domain types → repository interfaces → HTTP implementations → React contexts
- **Design tokens CSS** centralisés dans `src/core/styles/tokens/`
- **Generic Modal component** réutilisable dans `src/shared/components/Modal/`

### 2.2 Problèmes structurels 🟠

#### S1 — Fichier orphelin `[filename]` à la racine du projet

**Fichier** : `/[filename]` (racine du projet)
**Problème** : Contient des imports orphelins sans extension ni utilité. C'est un artefact de développement oublié.

```
import { CreateResource } from '../use-cases/CreateResource';
...
```

**Action** : Supprimer le fichier.

#### S2 — Fichier vide `EventDetailsView_new.tsx`

**Fichier** : `src/features/events/views/EventDetailsView_new.tsx`
**Problème** : Fichier vide (0 bytes), probablement un brouillon abandonné.
**Action** : Supprimer le fichier.

#### S3 — Dossier `layouts/BottomNav/` vide

**Fichier** : `src/layouts/BottomNav/`
**Problème** : Dossier vide sans contenu, probablement un ancien composant remplacé par `AppNavbar`.
**Action** : Supprimer le dossier.

#### S4 — Prolifération de fichiers `.md` à la racine

**Problème** : 20+ fichiers markdown de documentation/implémentation à la racine (`ADD_PARTICIPANT_FEATURE.md`, `BOTTOM_NAVBAR_FIX.md`, `CONTRIBUTIONS_UPDATE_OPTIMIZATION.md`, etc.). Cela rend la racine illisible.
**Action** : Déplacer dans un dossier `docs/` ou supprimer les fichiers obsolètes.

#### S5 — `AuthView` n'est jamais utilisé dans l'app

**Fichier** : `src/features/auth/views/AuthView.tsx`
**Problème** : Ce composant est exporté dans `index.ts` mais jamais importé dans `App.tsx`. L'app utilise directement `LoginModal` et `RegisterModal` dans `AppContent`. Code mort.
**Action** : Supprimer ou intégrer si c'est la version prévue.

#### S6 — `AppHeader` n'est jamais rendu

**Fichier** : `src/layouts/AppHeader/AppHeader.tsx`
**Problème** : Exporté dans `src/layouts/index.ts` mais jamais utilisé dans `AppLayout.tsx` ni ailleurs. L'app layout ne contient pas de header.
**Action** : Soit l'intégrer dans `AppLayout`, soit le supprimer.

---

## 3. Code Smells & Incohérences

### 3.1 — 🔴 Duplication massive : `HomePage` ≈ `HomeView`

**Fichiers** :

- `src/features/home/views/HomePage.tsx` (146 lignes)
- `src/features/home/views/HomeView.tsx` (147 lignes)

**Problème** : Ces deux fichiers sont quasiment identiques (>95% similaire). La seule différence est le type du prop `user` (`{ id: string; email: string }` vs `User`) et un texte dans le message "no events". C'est la duplication la plus critique du repo.

**Action** : Supprimer `HomeView.tsx`, ne garder que `HomePage.tsx` avec le type `User` complet.

### 3.2 — 🔴 Instanciation de repositories dans les composants

**Fichiers concernés** :

- `src/features/home/views/HomePage.tsx` (lignes 40-43, 71-74, 94-97)
- `src/features/home/views/HomeView.tsx` (mêmes lignes)
- `src/features/events/views/EventDetailsView.tsx` (lignes 55-57, 62, 75, 84)

**Problème** : Les repositories et use cases sont instanciés directement dans les composants de présentation avec `new HttpParticipantRepository(...)`. Cela :

- Viole le principe d'injection de dépendances de la clean architecture
- Crée des instances multiples à chaque render/callback
- Rend les composants non-testables sans mock complexe
- Est incohérent avec le pattern utilisé par `EventsProvider` et `ResourcesProvider`

**Action** : Créer un `ParticipantsProvider` contexte (comme `EventsProvider`) et injecter les dépendances via context.

### 3.3 — 🟠 `useEvents()` appelé deux fois dans `HomePage`

**Fichier** : `src/features/home/views/HomePage.tsx` (lignes 20, 29)

```tsx
const { events, loading } = useEvents(); // ligne 20
const { loadEvents } = useEvents(); // ligne 29
```

**Problème** : Double appel à `useEvents()` dans le même composant. Devrait être un seul appel destructuré.

**Action** : Fusionner en un seul appel : `const { events, loading, loadEvents } = useEvents();`

### 3.4 — 🟠 `authRepository` prop non utilisé dans `AppLayout`

**Fichier** : `src/layouts/AppLayout/AppLayout.tsx` (ligne 16)

```tsx
export const AppLayout: React.FC<AppLayoutProps> = ({ user }) => {
```

**Problème** : `authRepository` est déclaré dans `AppLayoutProps` (ligne 13) mais pas destructuré ni utilisé. Le prop est passé depuis `App.tsx` (ligne 190) inutilement.

**Action** : Supprimer le prop `authRepository` de l'interface et de l'appel.

### 3.5 — 🟠 `console.log` / `console.error` en production

**Fichiers concernés** (liste non exhaustive) :

- `src/features/auth/services/SupabaseAuthRepository.ts` — 8 occurrences de `console.log`/`console.error`
- `src/features/auth/views/AuthView.tsx` — `console.log('Login successful')`
- `src/features/auth/hooks/AuthProvider.tsx` — `console.log('Session expired...')`
- `src/features/events/hooks/EventsProvider.tsx` — `console.error` dans chaque callback
- `src/layouts/AppLayout/AppLayout.tsx` — `console.log('Event created successfully!')`

**Problème** : Logs de debug laissés en production. Risque de fuite d'info (emails, tokens dans les erreurs).

**Action** : Remplacer par un logger configurable (ex: `import.meta.env.DEV && console.log(...)`) ou supprimer les logs sensibles.

### 3.6 — 🟠 Validation email dupliquée 3 fois

**Fichiers** :

- `src/features/auth/use-cases/RegisterUser.ts` (ligne 45) : `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `src/features/auth/use-cases/SignInUser.ts` (ligne 22) : `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `src/features/auth/components/LoginModal.tsx` (ligne 37) : `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `src/features/auth/components/RegisterModal.tsx` (ligne 44) : `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Action** : Extraire dans un util partagé : `src/shared/utils/validation.ts`

### 3.7 — 🟠 Duplication du pattern de gestion d'erreurs dans les use cases

Tous les use cases suivent exactement le même pattern try/catch :

```tsx
try {
  return await this.repository.method(input);
} catch (error) {
  throw new Error(
    `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
  );
}
```

**Action** : Extraire un wrapper générique ou un décorateur pour les appels repository.

### 3.8 — 🟠 Incohérence d'identifiant utilisateur : `user.id` vs `user.email`

**Fichiers** :

- `src/features/events/views/EventDetailsView.tsx` (ligne 151-153) :
  ```tsx
  const isOrganizer =
    user?.id === currentEvent.organizerId ||
    user?.email === currentEvent.organizerId;
  ```
- `src/features/events/views/EventDetailsView.tsx` (lignes 218, 228) : `currentUserId={user?.email || ''}`
- `src/features/events/views/EventDetailsView.tsx` (ligne 166) : `r.contributors.some(c => c.userId === userEmail)`

**Problème** : Le backend renvoie l'email dans le champ `creator`, pas l'UUID. Le frontend doit vérifier les deux, ce qui est un hack. L'identité de l'utilisateur dans les contributions utilise `email` et non `id`. Il n'y a pas de cohérence.

**Action** : Normaliser côté backend, ou créer un helper `isCurrentUser(identifier)` qui centralise la logique.

### 3.9 — 🟠 `LoginModal` et `RegisterModal` ne réutilisent pas le composant `Modal` partagé

**Fichiers** :

- `src/features/auth/components/LoginModal.tsx` — implémente sa propre logique de modal (overlay, backdrop click, closing animation)
- `src/features/auth/components/RegisterModal.tsx` — même logique dupliquée

**Problème** : Le composant `Modal` générique existe dans `src/shared/components/Modal/` mais les modals d'auth ne l'utilisent pas. Duplication de logique + incohérence UX (animations différentes).

**Action** : Refactoriser pour utiliser le `Modal` partagé avec les formulaires `LoginForm`/`RegisterForm`.

### 3.10 — 🟡 `LoginForm` et `RegisterForm` orphelins

**Fichiers** :

- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`

**Problème** : Ces composants ne sont utilisés que dans `AuthView.tsx` qui lui-même n'est jamais monté dans l'app (voir S5). Ils sont donc effectivement du code mort.

**Action** : Soit les intégrer dans les Modals, soit supprimer `AuthView` et ces forms si les Modals sont la version définitive.

### 3.11 — 🟡 Magic numbers / strings

- `setTimeout(() => { onClose(); }, 400)` dans `LoginModal.tsx` et `RegisterModal.tsx` — le 400ms devrait être une constante CSS ou une variable
- URL hardcodée `'https://happyrow-front.vercel.app'` dans `SupabaseAuthRepository.ts` (lignes 33, 148) — devrait être une variable d'environnement
- URL hardcodée `'https://happyrow-core.onrender.com/event/configuration/api/v1'` dans 4 repositories HTTP — devrait être centralisée

### 3.12 — 🟡 `updateEvent` et `deleteEvent` dans `EventsProvider` ont `events` comme dépendance de `useCallback`

**Fichier** : `src/features/events/hooks/EventsProvider.tsx` (lignes 140, 163)

**Problème** : La copie de `events` pour le rollback crée une nouvelle référence à chaque changement d'events, ce qui invalide les callbacks et peut causer des re-renders en cascade.

**Action** : Utiliser `setEvents(prev => ...)` avec une ref pour le rollback au lieu de capturer `events` en closure.

### 3.13 — 🟡 SVG inline dans les composants

**Fichier** : `src/shared/components/AppNavbar/AppNavbar.tsx`, `LoginModal.tsx`, `RegisterModal.tsx`

**Problème** : Les icônes SVG sont directement inline dans le JSX (Google icon dupliqué 2 fois, icônes de nav). Ça alourdit les composants et rend la maintenance difficile.

**Action** : Extraire dans un dossier `src/shared/icons/` ou utiliser une bibliothèque d'icônes (Lucide, Heroicons).

### 3.14 — 🟡 `import.meta.env.VITE_API_BASE_URL` accédé dans chaque constructeur de repository

**Fichiers** : `HttpEventRepository.ts`, `HttpResourceRepository.ts`, `HttpContributionRepository.ts`, `HttpParticipantRepository.ts`

**Problème** : L'URL de base est lue depuis `import.meta.env` dans chaque constructeur séparément, avec le même fallback hardcodé. Ce n'est pas centralisé.

**Action** : Utiliser `apiConfig.baseUrl` de `src/core/config/api.ts` qui existe déjà mais n'est jamais utilisé par les repositories.

---

## 4. Sécurité

### 4.1 — 🔴 CSP trop permissive (nginx)

**Fichier** : `nginx.conf` (ligne 52)

```
Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'"
```

**Problème** : `'unsafe-inline'` permet l'exécution de scripts inline et ouvre la porte aux attaques XSS. `http:` et `https:` permettent le chargement de ressources depuis n'importe quel domaine.

**Action** : Resserrer la CSP :

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data:;
connect-src 'self' https://happyrow-core.onrender.com https://*.supabase.co;
```

### 4.2 — 🔴 CORS `Access-Control-Allow-Origin: *` en production

**Fichier** : `vercel.json` (ligne 18)

```json
"Access-Control-Allow-Origin": "*"
```

**Problème** : Wildcard CORS en production permet à n'importe quel site d'appeler votre API proxy. Combiné avec le Bearer token, c'est un risque de CSRF/data leak.

**Action** : Restreindre à `https://happyrow-front.vercel.app`.

### 4.3 — 🔴 Tokens JWT manipulés dans la couche présentation

**Fichiers** :

- `App.tsx` (ligne 184) : `getToken={() => session?.accessToken || null}`
- `src/layouts/AppLayout/AppLayout.tsx` — même pattern
- Tous les `HttpXxxRepository` constructors

**Problème** : Le token d'accès est passé en callback à travers plusieurs couches de composants React. Si un composant enfant est compromis (XSS), le token est accessible.

**Action** :

- Stocker le token via un service centralisé (pas dans le state React)
- Ne jamais passer le token en prop/callback — les repositories devraient le récupérer eux-mêmes via le service d'auth

### 4.4 — 🔴 URL de redirection hardcodée dans SupabaseAuthRepository

**Fichier** : `src/features/auth/services/SupabaseAuthRepository.ts`

```tsx
emailRedirectTo: 'https://happyrow-front.vercel.app',        // ligne 33
redirectTo: 'https://happyrow-front.vercel.app/reset-password', // ligne 148
```

**Problème** : URL hardcodée. Si un attaquant fork le code et modifie le backend, il peut rediriger vers un site malveillant. En dev, ça pointe vers la prod.

**Action** : Utiliser `window.location.origin` ou une variable d'environnement `VITE_APP_URL`.

### 4.5 — 🔴 Placeholder Supabase credentials en fallback

**Fichier** : `src/core/config/supabase.ts` (lignes 22-23)

```tsx
url: supabaseUrl || 'https://placeholder.supabase.co',
anonKey: supabaseAnonKey || 'placeholder-anon-key',
```

**Problème** : En l'absence de variables d'environnement, l'app tente de se connecter à un endpoint Supabase fictif. Cela pourrait être exploité si `placeholder.supabase.co` est enregistré par un attaquant (DNS squatting).

**Action** : Lever une erreur claire si les variables manquent au lieu de fallback silencieux.

### 4.6 — 🟠 `Playwright` en version alpha dans les dépendances

**Fichier** : `package.json` (ligne 58)

```json
"playwright": "1.59.0-alpha-1769819922000"
```

**Problème** : Version alpha non stable avec potentielles vulnérabilités non patched. Les versions alpha ne reçoivent pas de security fixes.

**Action** : Utiliser `@playwright/test` en version stable.

### 4.7 — 🟠 Pas de rate limiting ni de protection anti-brute-force

**Problème** : Les formulaires de login (`LoginModal`) ne limitent pas le nombre de tentatives. Un attaquant peut brute-force les mots de passe via le frontend.

**Action** : Ajouter un mécanisme de backoff exponentiel côté client + vérifier que Supabase Auth a des rate limits configurés.

### 4.8 — 🟠 Pas de sanitisation des inputs utilisateur

**Fichiers** : Tous les formulaires (`LoginModal`, `RegisterModal`, `CreateEventForm`, `AddParticipantForm`)

**Problème** : Les données utilisateur (nom, description, location) sont envoyées telles quelles au backend et affichées dans le DOM sans sanitisation. Risque de stored XSS si le backend ne sanitise pas non plus.

**Action** : Sanitiser les inputs avant affichage (React le fait par défaut pour le texte, mais `dangerouslySetInnerHTML` pourrait être ajouté plus tard) et avant envoi à l'API.

### 4.9 — 🟡 Headers de sécurité manquants dans `vercel.json`

**Problème** : Contrairement à `nginx.conf`, `vercel.json` ne définit aucun header de sécurité (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, etc.).

**Action** : Ajouter les headers de sécurité dans la config Vercel.

### 4.10 — 🟡 `npm ci --legacy-peer-deps` dans le Dockerfile

**Fichier** : `Dockerfile` (lignes 13, 47)

```dockerfile
RUN npm ci --legacy-peer-deps
```

**Problème** : `--legacy-peer-deps` ignore les conflits de peer dependencies, qui peuvent être des indicateurs de versions incompatibles ou vulnérables.

**Action** : Résoudre les conflits de peer deps proprement et retirer le flag.

---

## 5. Tests

### 5.1 — 🔴 Couverture de tests limitée au module `auth`

**Tests existants** (6 fichiers) :

- `tests/features/auth/components/ForgotPasswordForm.test.tsx`
- `tests/features/auth/hooks/AuthProvider.test.tsx`
- `tests/features/auth/services/SupabaseAuthRepository.test.ts`
- `tests/features/auth/views/AuthView.test.tsx`
- `tests/utils/testUtils.tsx`
- `tests/e2e/pwa.spec.ts`

**Modules sans aucun test** :

- `features/events/` — 0 tests (use cases, composants, provider)
- `features/resources/` — 0 tests
- `features/contributions/` — 0 tests
- `features/participants/` — 0 tests
- `features/home/` — 0 tests
- `features/user/` — 0 tests
- `shared/components/` — 0 tests (Modal, AppNavbar)
- `layouts/` — 0 tests

### 5.2 — 🟠 Tests potentiellement cassés

Les tests existants dans `tests/` testent des composants comme `AuthView` et `ForgotPasswordForm`, mais ces composants ne sont plus utilisés dans l'app (remplacés par les Modals). Les tests passent peut-être, mais ils testent du code mort.

### 5.3 — 🟠 Deux fichiers `vitest.setup`

**Fichiers** :

- `vitest.setup.js` (36 bytes)
- `vitest.setup.ts` (35 bytes)

**Problème** : Le `tsconfig.json` inclut `vitest.setup.ts` et `vite.config.ts` référence `./vitest.setup.ts`. Le fichier `.js` est inutile.

**Action** : Supprimer `vitest.setup.js`.

### 5.4 — 🟡 Ancien dossier `src/__tests__/` mentionné dans les mémoires mais absent

Les tests ont été déplacés vers `tests/` mais vérifier qu'il n'y a pas de références mortes.

---

## 6. Dépendances & Configuration

### 6.1 — 🟠 Version `0.0.0` dans `package.json`

**Problème** : La version n'a jamais été incrémentée. Pas de versioning sémantique.

**Action** : Adopter semver (`1.0.0` pour la première release stable).

### 6.2 — 🟠 `react-router-dom` pinné sans caret

**Fichier** : `package.json` (ligne 37)

```json
"react-router-dom": "7.13.0"
```

**Problème** : Version exacte sans `^`. Ne recevra pas les patch fixes de sécurité automatiquement.

**Action** : Ajouter `^` : `"^7.13.0"`.

### 6.3 — 🟡 `@lavamoat/allow-scripts` présent mais config incomplète

Le `lavamoat` config dans `package.json` ne couvre que 3 packages. Les nouveaux packages ajoutés ne seront pas protégés.

### 6.4 — 🟡 `apiConfig` dans `src/core/config/api.ts` inutilisé

`apiConfig.baseUrl` est calculé mais jamais importé par aucun repository HTTP. Chaque repo lit `import.meta.env.VITE_API_BASE_URL` directement.

### 6.5 — 🟡 Proxy dev dans `vite.config.ts` redirige vers la prod

**Fichier** : `vite.config.ts` (lignes 141-147)

```ts
'/api': {
  target: 'https://happyrow-core.onrender.com',
```

**Problème** : Le proxy de développement pointe vers le backend de production. Les développeurs travaillent directement contre la prod.

**Action** : Pointer vers un backend de dev local par défaut.

---

## 7. DevOps & CI/CD

### 7.1 — 🟠 `npm run test` dans le CI peut timeout

**Fichier** : `.github/workflows/deploy.yml` (ligne 38)

```yaml
- name: Run tests
  run: npm run test
```

**Problème** : `vitest` en mode watch par défaut. En CI, il faut `vitest run` ou configurer `CI=true`.

**Action** : Changer en `npm run test -- --run` ou ajouter un script `"test:ci": "vitest run"`.

### 7.2 — 🟡 `npm run clean` puis `npm run build` après les tests

**Fichier** : `.github/workflows/deploy.yml` (lignes 40-44)

**Problème** : `npm run clean` supprime `tsconfig.tsbuildinfo` et le cache, puis rebuild. Cela double le temps de build en CI sans bénéfice. Le clean devrait être fait avant les tests, pas après.

### 7.3 — 🟡 Lockfile-lint installé à la volée dans les workflows

**Fichier** : `.github/workflows/deploy.yml` (lignes 27-29)

```yaml
- name: Security check - Validate lockfile
  run: |
    npm install --save-dev lockfile-lint
```

**Problème** : `lockfile-lint` est déjà une devDependency. L'installer à nouveau modifie le lockfile en CI.

**Action** : Utiliser `npx lockfile-lint` directement après `npm ci`.

---

## 8. Plan d'amélioration priorisé

### Phase 1 — Nettoyage immédiat (1-2 heures)

| #   | Action                                                 | Sévérité | Fichiers                  |
| --- | ------------------------------------------------------ | -------- | ------------------------- |
| 1   | Supprimer `[filename]` à la racine                     | 🟡       | `/[filename]`             |
| 2   | Supprimer `EventDetailsView_new.tsx`                   | 🟡       | `events/views/`           |
| 3   | Supprimer `layouts/BottomNav/` vide                    | 🟡       | `layouts/`                |
| 4   | Supprimer `vitest.setup.js`                            | 🟡       | racine                    |
| 5   | Supprimer `HomeView.tsx` (doublon de `HomePage.tsx`)   | 🟠       | `home/views/`             |
| 6   | Fix double appel `useEvents()` dans `HomePage`         | 🟠       | `home/views/HomePage.tsx` |
| 7   | Retirer prop `authRepository` inutilisé de `AppLayout` | 🟡       | `layouts/AppLayout/`      |
| 8   | Déplacer les `.md` de documentation dans `docs/`       | 🟡       | racine                    |

### Phase 2 — Sécurité (2-4 heures)

| #   | Action                                                             | Sévérité |
| --- | ------------------------------------------------------------------ | -------- |
| 1   | Resserrer la CSP dans `nginx.conf`                                 | 🔴       |
| 2   | Restreindre CORS dans `vercel.json`                                | 🔴       |
| 3   | Remplacer les URL hardcodées par des variables d'env               | 🔴       |
| 4   | Lever une erreur si Supabase config manquante (pas de placeholder) | 🔴       |
| 5   | Ajouter headers de sécurité dans `vercel.json`                     | 🟠       |
| 6   | Remplacer Playwright alpha par une version stable                  | 🟠       |
| 7   | Retirer `--legacy-peer-deps` du Dockerfile                         | 🟠       |

### Phase 3 — Refactoring architecture (4-8 heures)

| #   | Action                                                                             | Sévérité |
| --- | ---------------------------------------------------------------------------------- | -------- |
| 1   | Créer un `ParticipantsProvider` (comme `EventsProvider`)                           | 🔴       |
| 2   | Centraliser l'accès au token dans un service auth (pas en prop)                    | 🔴       |
| 3   | Faire utiliser `apiConfig.baseUrl` par tous les repositories HTTP                  | 🟠       |
| 4   | Refactoriser `LoginModal`/`RegisterModal` pour utiliser le `Modal` partagé         | 🟠       |
| 5   | Extraire la validation email dans `shared/utils/validation.ts`                     | 🟠       |
| 6   | Décider du sort de `AuthView` + `LoginForm`/`RegisterForm` (supprimer ou intégrer) | 🟠       |
| 7   | Extraire les SVG inline dans des composants d'icônes                               | 🟡       |
| 8   | Fixer les dépendances `events` dans les `useCallback` de `EventsProvider`          | 🟡       |

### Phase 4 — Tests (4-8 heures)

| #   | Action                                                         | Sévérité |
| --- | -------------------------------------------------------------- | -------- |
| 1   | Ajouter des tests unitaires pour les use cases `events`        | 🔴       |
| 2   | Ajouter des tests pour `EventsProvider` et `ResourcesProvider` | 🟠       |
| 3   | Ajouter des tests pour les composants `Modal`, `AppNavbar`     | 🟠       |
| 4   | Ajouter des tests pour les repositories HTTP (mock fetch)      | 🟠       |
| 5   | Fixer le script test CI (`vitest run`)                         | 🟠       |
| 6   | Supprimer ou mettre à jour les tests de code mort (`AuthView`) | 🟡       |

### Phase 5 — Polish (2-4 heures)

| #   | Action                                                                 | Sévérité |
| --- | ---------------------------------------------------------------------- | -------- |
| 1   | Remplacer les `console.log`/`console.error` par un logger conditionnel | 🟠       |
| 2   | Versionner le projet (`1.0.0`)                                         | 🟡       |
| 3   | Ajouter `^` à `react-router-dom`                                       | 🟡       |
| 4   | Optimiser le workflow CI (retirer clean+rebuild, fix lockfile-lint)    | 🟡       |
| 5   | Pointer le proxy dev vers un backend local                             | 🟡       |

---

## Annexe — Fichiers à supprimer

```
/[filename]
/src/features/events/views/EventDetailsView_new.tsx
/src/layouts/BottomNav/                              (dossier vide)
/vitest.setup.js                                     (doublon de .ts)
/src/features/home/views/HomeView.tsx                (doublon de HomePage.tsx)
```

## Annexe — Fichiers à déplacer

```
Racine/*.md (hors README.md, ARCHITECTURE.md)  →  /docs/
```
