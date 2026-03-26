# HappyRow Frontend — Audit Complet

**Date :** 22 mars 2026
**Scope :** Analyse statique complète du frontend (src/, tests/, config, CI/CD, Docker)

---

## Table des matières

1. [Resume executif](#1-resume-executif)
2. [Vulnerabilites de securite](#2-vulnerabilites-de-securite)
3. [Code mort et inutilise](#3-code-mort-et-inutilise)
4. [Incoherences](#4-incoherences)
5. [Gestion des erreurs manquante](#5-gestion-des-erreurs-manquante)
6. [Performance](#6-performance)
7. [TypeScript et typage](#7-typescript-et-typage)
8. [Duplication de code](#8-duplication-de-code)
9. [Accessibilite (a11y)](#9-accessibilite-a11y)
10. [CSS et Design Tokens](#10-css-et-design-tokens)
11. [Tests](#11-tests)
12. [Configuration et CI/CD](#12-configuration-et-cicd)
13. [Dependances](#13-dependances)
14. [Architecture](#14-architecture)
15. [Plan d'action recommande](#15-plan-daction-recommande)

---

## 1. Resume executif

| Categorie          | Critique | Haute | Moyenne | Basse | Total |
| ------------------ | -------- | ----- | ------- | ----- | ----- |
| Securite           | 0        | 2     | 6       | 5     | 13    |
| Code mort          | —        | —     | —       | —     | 12    |
| Incoherences       | —        | —     | —       | —     | 15    |
| Erreurs manquantes | —        | —     | —       | —     | 11    |
| Performance        | —        | —     | —       | —     | 8     |
| TypeScript         | —        | —     | —       | —     | 8     |
| Duplication        | —        | —     | —       | —     | 6     |
| Accessibilite      | —        | —     | —       | —     | 10    |
| CSS / Tokens       | —        | —     | —       | —     | 20+   |
| Tests              | —        | —     | —       | —     | 6     |
| Config / CI        | —        | —     | —       | —     | 8     |

**Points forts du projet :**

- Architecture clean (features, use-cases, repositories, hooks) bien structuree
- Securite des secrets : `.env` gitignore, lockfile-lint, lavamoat, husky
- PWA correctement configuree avec strategies de cache Workbox
- Design tokens definis (couleurs, espacement, typographie)
- TypeScript strict active

**Points critiques a traiter en priorite :**

- URLs de redirection auth hardcodees (risque de casse multi-environnement)
- Playwright config cassee (baseURL ≠ preview port)
- Dependance Playwright en version alpha
- Couverture de tests quasi inexistante hors `auth`
- Nombreuses valeurs hardcodees dans le CSS au lieu des design tokens

---

## 2. Vulnerabilites de securite

### HIGH

| ID  | Fichier                                                | Lignes              | Description                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| S1  | `src/features/auth/services/SupabaseAuthRepository.ts` | 33, 148             | **URLs de redirection auth hardcodees** vers `https://happyrow-front.vercel.app`. Les flux email (confirmation, reset password) ne fonctionneront pas sur GitHub Pages, previews, ou autres domaines. L'OAuth utilise correctement `window.location.origin`. |
| S2  | `src/features/auth/services/SupabaseAuthRepository.ts` | 27, 52, 57, 74, 142 | **PII loguees en console** — les adresses email et evenements d'auth apparaissent dans `console.log/error` en production. Risque de fuite via shoulder surfing ou log aggregation.                                                                           |

### MEDIUM

| ID  | Fichier                                                | Description                                                                                                                                       |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| S3  | `SupabaseAuthRepository.ts` (via use-cases)            | **Messages d'erreur Supabase exposes a l'UI** — permet l'enumeration de comptes (savoir si un email existe).                                      |
| S4  | `src/core/config/supabase.ts` L19-24                   | **Placeholder URL/key quand les env vars manquent** — le build semble fonctionner avec une config factice au lieu de fail fast.                   |
| S5  | `src/features/auth/types/User.ts` + `AuthProvider.tsx` | **`accessToken` et `refreshToken` exposes dans le React context** — tout XSS peut les exfiltrer.                                                  |
| S6  | `AuthProvider.tsx`                                     | **Bootstrap via `getSession()` (local)** au lieu de `getUser()` (valide cote serveur) — confiance dans un JWT potentiellement expire ou falsifie. |
| S7  | `SupabaseAuthRepository.ts` L34-37                     | **`metadata` spread sans validation** dans `signUp` — si des callers passent des donnees non fiables, le user_metadata Supabase est incontrole.   |
| S8  | `HttpParticipantRepository.ts` L111-112, L140-141      | **`userEmail` dans l'URL sans `encodeURIComponent`** — les emails avec caracteres speciaux peuvent casser ou detourner les requetes.              |

### LOW

| ID  | Fichier                           | Description                                                                                                                            |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| S9  | `src/core/config/api.ts` L24      | **URL du backend hardcodee** (`happyrow-core.onrender.com`) — couplage d'infrastructure et disclosure du hostname.                     |
| S10 | Workbox config (`vite.config.ts`) | **Cache `NetworkFirst` pour les APIs** — risque de cache de reponses authentifiees si le backend ne set pas `Cache-Control: no-store`. |
| S11 | `RegisterUser.ts` L33-35          | **Politique de mot de passe faible** — longueur min 8, aucune complexite requise.                                                      |
| S12 | Formulaires auth                  | **Pas de max length** sur les champs — risque de DoS/abus au niveau API.                                                               |
| S13 | `App.tsx` ErrorBoundary           | **`error.message` affiche a l'utilisateur** — peut reveler des details d'implementation.                                               |

**Recommandations securite :**

```typescript
// S1 — Utiliser window.location.origin pour les redirections
emailRedirectTo: `${window.location.origin}/auth/callback`;

// S2 — Conditionner les logs
if (import.meta.env.DEV) console.log('Auth event:', event);

// S4 — Fail fast en production
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}
```

---

## 3. Code mort et inutilise

### Composants et vues non montes

| Fichier                                                       | Probleme                                                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `src/features/home/views/HomeView.tsx`                        | N'est **jamais utilise** par `App.tsx` (le routing utilise `HomePage`).                         |
| `src/features/participants/components/AddParticipantForm.tsx` | Composant **jamais importe** par aucun consumer, seulement re-exporte par le barrel `index.ts`. |
| `src/layouts/AppHeader/AppHeader.tsx`                         | **Jamais rendu** — aucun import dans l'app active.                                              |

### Exports morts dans les barrels

| Barrel                               | Export mort                                        |
| ------------------------------------ | -------------------------------------------------- |
| `src/features/home/index.ts`         | `HomeView` — exporte mais jamais importe ailleurs  |
| `src/features/participants/index.ts` | `AddParticipantForm` — exporte mais jamais importe |
| `src/layouts/index.ts`               | `AppHeader` — exporte mais jamais utilise          |

### Variables et parametres inutilises

| Fichier                        | Lignes | Description                                                                  |
| ------------------------------ | ------ | ---------------------------------------------------------------------------- |
| `useEventActions.ts`           | 96     | `setError` retourne par le hook mais jamais utilise par les consumers.       |
| `useContributionOperations.ts` | 14-15  | `resources` requis dans les params mais jamais utilise dans le hook.         |
| `useContributionOperations.ts` | 63-67  | `_userId` dans `updateContribution` — jamais transmis au use case.           |
| `ResourcesContext.tsx`         | 24-27  | `userId` sur `updateContribution` dans l'API publique — ignore par le stack. |
| `AppLayout.tsx`                | 11-16  | `authRepository` dans les props — jamais utilise dans le body du composant.  |

### Fonctionnalites mortes

| Fichier                                       | Description                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `contributions/use-cases/GetContributions.ts` | Use case exporte mais **jamais importe** dans le code source.                       |
| `HttpResourceRepository.ts` L110-132          | `getResourceById` implemente mais **jamais appele** depuis le code applicatif.      |
| `ResourcesProvider.tsx` L125, L148            | `refreshResource` expose dans le context mais **aucun consumer** ne le destructure. |
| `App.tsx` L128-134                            | Code de loading screen **commente** — bruit dans le fichier.                        |

### Fichiers CSS inutilises (composant parent jamais monte)

| Fichier CSS              | Raison                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `AddParticipantForm.css` | Seul importe par `AddParticipantForm.tsx` (composant mort).                                     |
| `AppHeader.css`          | Seul importe par `AppHeader.tsx` (composant mort).                                              |
| `AppLayout.css` L14-26   | Classes `.loading-screen`, `.loading-spinner` — referencees uniquement depuis du code commente. |

---

## 4. Incoherences

### Incoherences de patterns

| Domaine                                 | Description                                                                                                                                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Imports**                             | Mix de `import type` et imports de valeur pour le meme type (ex: `ResourceCategory` en type dans `InlineAddResourceForm` vs valeur dans `AddResourceForm`).                                                        |
| **Gestion d'erreurs HTTP**              | `create`/`update` parsent le JSON du body d'erreur ; `getById`/`delete` n'utilisent que le status text. Pattern inconsistant dans `HttpEventRepository`, `HttpResourceRepository`, `HttpContributionRepository`.   |
| **Strategie de refresh**                | `useResourceOperations` fait des mises a jour optimistes sans refetch ; `useContributionOperations` refetch la liste complete apres chaque operation. Strategies differentes pour des donnees liees.               |
| **Identite utilisateur**                | `EventDetailsView` compare `user?.id` et `user?.email` avec `currentEvent.organizerId` (UUID vs email). Le mapping `HttpEventRepository` utilise `creator` → `organizerId` mais creator est un email, pas un UUID. |
| **Contrat interface vs implementation** | `EventRepository.deleteEvent(id, userId)` — l'implementation n'envoie jamais `userId` a l'API.                                                                                                                     |
| **Double appel `useEvents()`**          | `HomeView.tsx` L21/L31 et `HomePage.tsx` L20/L30 appellent `useEvents()` deux fois dans le meme composant.                                                                                                         |
| **Types de props user**                 | `HomePage.tsx` utilise un type inline `{ id: string; email: string }` vs `HomeView.tsx` utilise `User` du module auth.                                                                                             |

### Incoherences de langue

| Fichier                      | Description                                                              |
| ---------------------------- | ------------------------------------------------------------------------ |
| `CreateEventForm.tsx` L19-20 | Commentaire en francais (`// Ajouter 1 heure`) dans un codebase anglais. |
| `Modal.css` L53-60, L88-96   | Commentaires en francais dans un CSS autrement anglais.                  |

### Incoherences de copie

| Fichier                                            | Description                                                                                     |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `WelcomeView.tsx` L34                              | "All Right Reserved" — devrait etre "All **Rights** Reserved".                                  |
| `CreateResource.ts` L16-17                         | Message "Quantity must be **positive**" mais le check est `quantity < 0` — 0 est donc autorise. |
| `HomeView.tsx` L141-142 vs `HomePage.tsx` L139-140 | Copie UX differente pour le meme etat vide (deux composants quasi-dupliques).                   |

### Barrels incomplets

| Barrel               | Modules manquants                                                                                    |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `events/index.ts`    | `MyContributionsList`, `ResourceCategorySection`, `useEventActions`, `useParticipants` non exportes. |
| `resources/index.ts` | `useContributionOperations`, `useResourceOperations` non exportes.                                   |
| `home/index.ts`      | `EventCard` exporte depuis `home/components/index.ts` mais pas depuis `home/index.ts`.               |

---

## 5. Gestion des erreurs manquante

| Fichier                         | Lignes  | Description                                                                                                                                          |
| ------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EventDetailsView.tsx`          | 60-93   | `handleAddParticipant`, `handleRemoveParticipant`, `handleUpdateParticipantStatus` — **aucun try/catch**, les erreurs se propagent sans feedback UI. |
| `EventDetailsView.tsx`          | 115-144 | `handleAddResource` et handlers de contribution — pas de try/catch local, depend entierement du contexte resources.                                  |
| `EventDetailsView.tsx`          | 125-144 | `handleAddContribution`/`update`/`delete` — return silencieux si `!user`, aucune erreur affichee.                                                    |
| `useParticipants.ts`            | 27-35   | `loadParticipants` catch + `console.error` — **pas de state error**, l'UI reste vide sans feedback.                                                  |
| `CreateEventForm.tsx`           | 135-137 | Submit catch uniquement `console.error` — l'utilisateur ne voit aucun feedback d'echec.                                                              |
| `UpdateEventForm.tsx`           | 132-134 | Meme probleme que CreateEventForm.                                                                                                                   |
| `ResourceItem.tsx`              | 64-68   | Echec de contribution : `console.error` seulement, pas d'erreur dans l'UI.                                                                           |
| `useContributionOperations.ts`  | 132-147 | `refreshResource` quand `currentEventId` est null — no-op silencieux sans error state.                                                               |
| `HomeView.tsx` / `HomePage.tsx` | 86-88   | `loadParticipantCountsForEvent` log les erreurs mais **ne met pas a jour l'UI**.                                                                     |
| `UserProfilePage.tsx`           | 15-17   | Erreur de sign-out : `console.error` seulement, aucun feedback utilisateur.                                                                          |
| `HttpParticipantRepository.ts`  | 150-152 | `removeParticipant` sur `!response.ok` : throw generique **sans** parser le body JSON.                                                               |

---

## 6. Performance

| Fichier                                | Description                                                                                                                                                                            | Impact      |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `EventsProvider.tsx` L113-164          | `updateEvent` et `deleteEvent` ont `events` dans leurs dependency arrays `useCallback` — toute modification de la liste recrée ces callbacks et peut causer des re-renders en cascade. | Moyen       |
| `useResourceOperations.ts` L46-89      | Meme probleme : `resources` dans les deps de `updateResource`/`deleteResource`.                                                                                                        | Moyen       |
| `ResourcesProvider.tsx` L137-149       | La `value` du Context est un **nouvel objet a chaque render** — tous les consumers `useResources()` re-render a chaque changement.                                                     | Moyen       |
| `EventDetailsView.tsx` L110-113        | `useEffect` depend de `event` ET `event.id` — si `event` est une nouvelle reference a chaque render, l'effect tourne plus que necessaire.                                              | Faible      |
| `HomeView.tsx` / `HomePage.tsx` L38-70 | **Pattern N+1** : un appel `GetParticipants` par event. Acceptable avec peu d'events, problematique avec une liste longue.                                                             | Moyen       |
| `main.tsx` L3 + `App.tsx` L18          | `@/core/styles/index.css` importe **deux fois** (deduplique par le bundler mais redondant).                                                                                            | Negligeable |
| `UpdateEventForm.tsx` L26-56           | `formatDateForInput`/`formatTimeForInput` recreees a chaque render.                                                                                                                    | Negligeable |
| `EventCard.tsx` L122-148               | Boutons "Message" et "Resources" : `stopPropagation()` uniquement, **aucune fonctionnalite**. UI trompeuse.                                                                            | UX          |

---

## 7. TypeScript et typage

| Fichier                                                   | Lignes                                                                            | Description                                                                                                        |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `HttpEventRepository.ts`                                  | 40-41                                                                             | `type.toUpperCase() as EventType` — assertion non verifiee, des valeurs API invalides deviennent des enums bogues. |
| `HttpResourceRepository.ts`                               | 48-49                                                                             | `category.toUpperCase() as ResourceCategory` — meme probleme.                                                      |
| `AddResourceForm.tsx`                                     | 88                                                                                | `e.target.value as ResourceCategory` — assertion au lieu de validation.                                            |
| `EventDetailsView.tsx`                                    | 172                                                                               | `r.contributors.find(...)!.quantity` — non-null assertion, crash si la liste de contributors diverge.              |
| `MyContributionsList.tsx`                                 | 16                                                                                | `Record<string, string>` pour `CATEGORY_ICONS` — plus faible que `Record<ResourceCategory, string>`.               |
| `AddParticipant.ts` L33, `UpdateParticipantStatus.ts` L31 | `as ParticipantStatus` depuis un `string` arbitraire — pas de validation runtime. |
| `HttpParticipantRepository.ts`                            | 162                                                                               | `status: response.status as ParticipantStatus` — confiance aveugle dans l'API.                                     |
| `Contribution.ts`                                         | 7-8                                                                               | Pas de `updatedAt` dans le domaine ; l'API retourne `updated_at` mais il est **ignore** lors du mapping.           |

**Recommandation :** Creer des fonctions de validation pour les enums :

```typescript
function toEventType(value: string): EventType {
  const upper = value.toUpperCase();
  if (Object.values(EventType).includes(upper as EventType)) {
    return upper as EventType;
  }
  throw new Error(`Invalid EventType: ${value}`);
}
```

---

## 8. Duplication de code

| Zone                                                     | Description                                                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CreateEventForm.tsx` ↔ `UpdateEventForm.tsx`           | `validateForm` + champs de formulaire largement dupliques. Extraire un `validateEventFormFields` partage + composants de champs communs.                      |
| `HomeView.tsx` ↔ `HomePage.tsx`                         | **Quasi-dupliques** : state, effects, participant loading, JSX. Seules differences : copie d'etat vide et type de props `user`.                               |
| `EventDetailsView.tsx` L214-233                          | Deux blocs `ResourceCategorySection` ne different que par `title`/`category`/`resources` — mapper sur un tableau de config.                                   |
| `HttpResourceRepository` ↔ `HttpContributionRepository` | Pattern HTTP repete : constructeur avec `getToken` + `baseUrl`, garde token, `fetch`, `!response.ok`, mapping JSON. Extraire un `BaseHttpRepository`.         |
| `HttpContributionRepository.ts` L65-141                  | `createContribution` et `updateContribution` font toutes deux POST sur le meme pattern d'URL avec un handling quasi-identique.                                |
| Use cases contributions vs resources                     | Contributions wrappent les erreurs (`try/catch` + `new Error('Failed to…')`) ; Resources laissent les erreurs se propager. Patterns de validation differents. |

---

## 9. Accessibilite (a11y)

### Critique

| Fichier                         | Description                                                                                                                                          |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EventCard.tsx` L60-65          | `role="button"` + `tabIndex={0}` mais **pas de `onKeyDown`** pour Enter/Space — les utilisateurs clavier ne peuvent pas activer la carte.            |
| `ConfirmDeleteModal.tsx` L22-24 | Pas de `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, ni focus trap. Le focus n'est pas deplace vers le dialog ni restaure a la fermeture. |

### Important

| Fichier                        | Description                                                                                                             |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `ConfirmDeleteModal.tsx`       | Pas de gestion de la touche `Escape` pour fermer.                                                                       |
| `Modal.tsx` L54-60             | Bouton de fermeture "x" sans `aria-label` (ex: "Fermer").                                                               |
| `ParticipantList.tsx` L130-142 | Controle de statut : pas de `aria-expanded`, `aria-haspopup`, ni navigation clavier (Escape, fleches) pour le dropdown. |
| `AppNavbar.tsx` L16            | `<nav>` sans `aria-label` — problematique si plusieurs landmarks nav existent.                                          |

### Moyen

| Fichier                               | Description                                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `InlineAddResourceForm.tsx` L78-98    | Champs nom et quantite sans `<label>` associe ni `aria-label` — les lecteurs d'ecran ne peuvent pas identifier les champs. |
| `ResourceItem.tsx` L119-125           | Bouton "Validate" sans `aria-label` incluant le nom de la ressource pour le contexte SR.                                   |
| `CreateEventForm` / `UpdateEventForm` | Messages d'erreur non lies aux inputs via `aria-describedby` / `aria-invalid="true"`.                                      |
| `EventDetailsView.tsx` L185-191       | Emojis decoratifs sans `aria-hidden="true"`.                                                                               |

---

## 10. CSS et Design Tokens

### Valeurs hardcodees (violation des regles projet)

Le projet definit des design tokens mais de **nombreux fichiers CSS utilisent des valeurs brutes** :

| Fichier                                         | Exemples de violations                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| `ParticipantList.css` L32-45                    | `rgba(0, 128, 128, …)` au lieu de token teal                   |
| `AddParticipantModal.css` L11, 45, 54, 87       | Multiples `rgba(…)` hardcodees (coral, teal, navy)             |
| `HomeView.css` L4                               | Gradient avec `#f0f8f7`, `#fff5f4`, `#f5f9fb` hardcodes        |
| `EventCard.css` L37-41, 92, 195, 278, 334       | Gradient hex, `#d88f89` hover, dimensions hors grille          |
| `WelcomeView.css` L76-82                        | Gradient hex dans `.btn-create-account`                        |
| `UserProfilePage.css` L5, 46, 110               | Gradient duplique, `color: white`, `#d88f89`                   |
| `AppNavbar.css` L38-39, 55, 76, 86, 92-102, 122 | `rgba(…)` box shadows, `color: white`, `20px` gap hors echelle |
| `Modal.css` L51, 76, 85                         | Timing hardcode, `color: white`                                |
| `AppLayout.css` L10                             | `90px` hardcode (devrait s'aligner sur un token navbar height) |
| `global.css` L14                                | `320px` min-width hardcode                                     |

### Derive design system

| Probleme        | Detail                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gradient legacy | `colors.css` contient des tokens `--color-primary-gradient-*` et `--bg-gradient` en **violet** qui coexistent avec la palette teal/navy/coral — risque de derive. |
| Dark mode       | `global.css` L132-134 contient un bloc `prefers-color-scheme: dark` **vide** — placeholder non implemente.                                                        |
| Code commente   | `AppNavbar.css` L117-118 — regles padding commentees.                                                                                                             |

---

## 11. Tests

### Couverture

| Feature                     | Tests unitaires                               | Tests E2E                 |
| --------------------------- | --------------------------------------------- | ------------------------- |
| `auth`                      | 4 fichiers (repository, view, form, provider) | Aucun                     |
| `events`                    | **Aucun**                                     | Aucun                     |
| `resources`                 | **Aucun**                                     | Aucun                     |
| `contributions`             | **Aucun**                                     | Aucun                     |
| `participants`              | **Aucun**                                     | Aucun                     |
| `home` / `welcome` / `user` | **Aucun**                                     | Aucun                     |
| PWA                         | —                                             | 1 fichier (`pwa.spec.ts`) |
| Routing / App               | **Aucun**                                     | Aucun                     |

### Qualite des tests existants

| Aspect                           | Evaluation                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ForgotPasswordForm.test.tsx`    | Bonne qualite — teste le comportement avec roles et labels.                                                                                                       |
| `SupabaseAuthRepository.test.ts` | Utile mais **asserte des URLs de deployment fixes** — fragile.                                                                                                    |
| `AuthView.test.tsx`              | Mock lourd des forms — **faible signal comportemental** (teste surtout que les boutons existent).                                                                 |
| `pwa.spec.ts`                    | Le listener `pageerror` est enregistre **apres** `goto` et `networkidle` — les erreurs precoces peuvent etre **manquees**. Utilise `waitForTimeout` fixe (flaky). |

### Manques

- **Pas de script `test:coverage`** ni de plugin `@vitest/coverage-*` dans `package.json`.
- **CI ne lance pas Playwright** (`test:e2e`).
- **`tests/` n'est pas dans le `include` de `tsconfig.json`** — le type-checking editeur peut ne pas fonctionner pour les tests.

---

## 12. Configuration et CI/CD

### Playwright — Misconfiguration critique

`playwright.config.ts` :

- `use.baseURL` = `http://localhost:5173` (port dev)
- `webServer` lance `npm run preview` qui sert sur le port **4173**

Les tests Playwright ciblent le **mauvais port** quand ils utilisent le serveur lance par Playwright.

### Docker

| Probleme                 | Fichier      | Description                                                                                    |
| ------------------------ | ------------ | ---------------------------------------------------------------------------------------------- |
| **HEALTHCHECK casse**    | `Dockerfile` | Utilise `curl -f http://localhost:80/` mais `nginx:alpine` **n'inclut pas `curl`** par defaut. |
| **`--legacy-peer-deps`** | `Dockerfile` | `npm ci --legacy-peer-deps` peut masquer des problemes de dependances.                         |
| **Header Host**          | `nginx.conf` | `proxy_set_header Host $host` pour `/api/` — le Host vu par Render peut etre incorrect.        |

### CI (`deploy.yml`)

| Probleme              | Description                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------- |
| Redondance            | `npm install --save-dev lockfile-lint` dans le CI alors que c'est deja dans `package.json`. |
| Tests E2E absents     | Le pipeline ne lance **pas** Playwright.                                                    |
| Pas de typecheck step | Le build TypeScript est implicite dans `tsc -b && vite build` mais pas de step dedie.       |

### ESLint

| Probleme                      | Description                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Config files ignores          | `globalIgnores` inclut `*.config.js` et `*.config.ts` — `playwright.config.ts` et `vite.config.ts` ne sont pas lintes. |
| `ecmaVersion: 2020`           | tsconfig cible ES2022 — inconsistance mineure.                                                                         |
| Pas de plugin testing-library | Recommande pour ameliorer la qualite des tests.                                                                        |

---

## 13. Dependances

### Dependances a risque

| Package           | Version                      | Probleme                                                          |
| ----------------- | ---------------------------- | ----------------------------------------------------------------- |
| `playwright`      | `1.59.0-alpha-1769819922000` | **Version alpha explicite** — non fiable pour CI/reproducibilite. |
| `@playwright/mcp` | `0.0.62`                     | **Semver 0.0.x** — API instable.                                  |

### Dependances majeures recentes

| Package               | Version   | Note                                                                |
| --------------------- | --------- | ------------------------------------------------------------------- |
| `react` / `react-dom` | `^19.1.1` | React 19 — OK si intentionnel, verifier la compatibilite ecosystem. |
| `vite`                | `^7.1.2`  | Vite 7 tres recent — surveiller la compatibilite des plugins.       |
| `jsdom`               | `^27.0.0` | Major agressif — surveiller la compatibilite Vitest/RTL.            |

### Points positifs

- `lockfile-lint` pour verifier le lockfile
- `husky` + `lint-staged` pour les hooks pre-commit
- `@lavamoat/allow-scripts` pour controler les scripts post-install

---

## 14. Architecture

### Points forts

- **Feature-driven architecture** bien respectee : chaque feature a ses composants, hooks, services, use-cases, types
- **Clean architecture** : separation entre UI, business logic (use-cases) et acces donnees (repositories)
- **Repository pattern** avec interfaces TypeScript (`AuthRepository`, `EventRepository`, etc.)
- **Context/Provider pattern** pour le state management
- **Index barrels** pour les exports publics

### Points faibles

| Zone                                 | Probleme                                                                                                                                                              |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Barrels incomplets**               | Plusieurs modules internes ne sont pas re-exportes (events, resources, home) — certains consumers importent en chemin profond.                                        |
| **Duplication hooks/composants**     | `HomeView` vs `HomePage` quasi-dupliques ; `CreateEventForm` vs `UpdateEventForm` dupliques.                                                                          |
| **Couplage contributions/resources** | Les hooks de contribution (`useContributionOperations`) vivent dans `resources/hooks/` — le feature `contributions` est sous-utilise (son barrel est quasiment mort). |
| **Pas de layer API generique**       | Chaque `HttpRepository` repete le meme pattern fetch/token/error. Un `BaseHttpRepository` ou une fonction `fetchWithAuth` simplifierait et uniformiserait.            |
| **Pas de gestion d'erreur globale**  | Chaque composant/hook gere (ou pas) ses erreurs independamment. Un systeme de toast/notification centralise manque.                                                   |
| **Pas de lazy loading**              | Toutes les routes sont chargees upfront — pas de `React.lazy()` / `Suspense` pour le code splitting.                                                                  |

---

## 15. Plan d'action recommande

### Priorite 1 — Critique (a faire immediatement)

| #   | Action                                                                                       | Effort |
| --- | -------------------------------------------------------------------------------------------- | ------ |
| 1   | Corriger les URLs de redirection auth → `window.location.origin`                             | 30 min |
| 2   | Corriger la config Playwright (`baseURL` = port 4173)                                        | 5 min  |
| 3   | Remplacer `playwright` alpha par une version stable                                          | 10 min |
| 4   | Supprimer les `console.log` de PII en production (ou conditionner sur `import.meta.env.DEV`) | 1h     |
| 5   | Fail fast si les env vars Supabase manquent en production                                    | 30 min |

### Priorite 2 — Haute (semaine prochaine)

| #   | Action                                                                                                   | Effort |
| --- | -------------------------------------------------------------------------------------------------------- | ------ |
| 6   | Ajouter `encodeURIComponent` sur les emails dans les URLs API                                            | 30 min |
| 7   | Uniformiser la gestion d'erreurs HTTP (parser le body partout ou nulle part)                             | 2h     |
| 8   | Ajouter des feedback d'erreur UI la ou il n'y en a pas (forms, participant ops, sign-out)                | 3h     |
| 9   | Fixer l'accessibilite critique : `EventCard` keyboard, `ConfirmDeleteModal` focus trap + dialog role     | 3h     |
| 10  | Creer des fonctions de validation pour les type assertions (`as EventType`, `as ResourceCategory`, etc.) | 2h     |

### Priorite 3 — Moyenne (sprint courant)

| #   | Action                                                                                | Effort |
| --- | ------------------------------------------------------------------------------------- | ------ |
| 11  | Supprimer le code mort : `HomeView`, `AddParticipantForm`, `AppHeader`, code commente | 1h     |
| 12  | Fusionner `HomeView` et `HomePage` en un seul composant                               | 2h     |
| 13  | Extraire un formulaire evenement partage (Create/Update)                              | 3h     |
| 14  | Extraire un `BaseHttpRepository` ou `fetchWithAuth`                                   | 3h     |
| 15  | Remplacer les valeurs CSS hardcodees par des design tokens                            | 4h     |
| 16  | Corriger le Docker HEALTHCHECK (`wget` au lieu de `curl`)                             | 15 min |
| 17  | Ajouter Playwright E2E dans le pipeline CI                                            | 2h     |

### Priorite 4 — Basse (backlog)

| #   | Action                                                                            | Effort |
| --- | --------------------------------------------------------------------------------- | ------ |
| 18  | Ajouter `test:coverage` avec `@vitest/coverage-v8`                                | 1h     |
| 19  | Ecrire des tests pour `events`, `resources`, `participants`                       | 8-12h  |
| 20  | Stabiliser les dependency arrays dans les providers (utiliser functional updates) | 2h     |
| 21  | Implementer un systeme de notification/toast global pour les erreurs              | 4h     |
| 22  | Ajouter `React.lazy()` / code splitting par route                                 | 2h     |
| 23  | Inclure `tests/` dans le `tsconfig.json` include                                  | 5 min  |
| 24  | Mapper les erreurs Supabase vers des messages generiques (anti-enumeration)       | 2h     |
| 25  | Nettoyer les tokens CSS legacy (gradients violets)                                | 1h     |
| 26  | Renforcer la politique de mot de passe (complexite)                               | 1h     |
| 27  | Ajouter `eslint-plugin-testing-library`                                           | 30 min |
| 28  | Deplacer `useContributionOperations` dans le feature `contributions`              | 2h     |

---

_Rapport genere le 22 mars 2026 — Analyse statique frontend uniquement. L'audit backend (RLS Supabase, validation API, JWT verification) est hors scope mais indispensable pour une securite de bout en bout._
