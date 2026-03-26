# Optimisation de la mise à jour des contributions

## Contexte

Date: Février 2026  
Problème résolu: Suppression du GET après updateContribution pour gérer la mise à jour dans le front

## Problème initial

Lors de la mise à jour d'une contribution, le système effectuait:

1. Un POST pour mettre à jour la contribution
2. Un GET pour recharger toutes les ressources de l'événement

Cela créait:

- 2 requêtes HTTP au lieu d'une seule
- Un délai perceptible dans l'interface
- Un rechargement inutile de toutes les données

## Incohérences de l'API Backend découvertes

⚠️ **IMPORTANT**: L'API backend utilise des identifiants utilisateur différents selon les endpoints:

### Endpoint Resources (`/events/{id}/resources`)

```json
{
  "contributors": [
    {
      "user_id": "jimmy.ni@hotmail.fr", // ← EMAIL de l'utilisateur
      "quantity": 30,
      "contributed_at": 1770025044256
    }
  ]
}
```

### Endpoint Contributions (`/events/{id}/resources/{id}/contributions`)

```json
{
  "identifier": "f1804cea-...",
  "participant_id": "e98b8fc5-6e13-46e3-849f-0e4f7e2369bd", // ← UUID du participant
  "resource_id": "7b90e304-...",
  "quantity": 381,
  "created_at": 1770025044256,
  "updated_at": 1770281420062
}
```

### Frontend (Supabase)

L'utilisateur connecté a un ID Supabase: `ab70634a-345e-415e-8417-60841b6bcb20`

**Résultat**: 3 identifiants différents pour le même utilisateur!

- Email dans les contributors
- participant_id dans les contributions
- Supabase ID dans le frontend

## Solution implémentée

### 1. Correction du mapping API

Fichier: `src/features/contributions/services/HttpContributionRepository.ts`

```typescript
interface ContributionApiResponse {
  identifier: string;
  participant_id: string; // ✅ Corrigé (était user_id)
  resource_id: string;
  quantity: number;
  created_at: number; // ✅ Corrigé (était creation_date)
  updated_at?: number; // ✅ Ajouté
}
```

### 2. Mise à jour optimisée sans GET

Fichier: `src/features/resources/hooks/ResourcesProvider.tsx`

La fonction `updateContribution` implémente maintenant:

#### a) Stratégie de matching multi-niveaux

```typescript
// Strategy 1: Try to find by participant_id (UUID from API)
let oldContributor = r.contributors.find(c => c.userId === participantId);

// Strategy 2: If not found, try by userId parameter (Supabase ID)
if (!oldContributor) {
  oldContributor = r.contributors.find(c => c.userId === userId);
}

// Strategy 3: If only one contributor, assume it's them
if (!oldContributor && r.contributors.length === 1) {
  oldContributor = r.contributors[0];
}
```

#### b) Calcul du delta et mise à jour locale

```typescript
const oldQuantity = oldContributor?.quantity || 0;
const deltaQuantity = updatedContribution.quantity - oldQuantity;

return {
  ...r,
  currentQuantity: r.currentQuantity + deltaQuantity,
  contributors: updatedContributors,
};
```

#### c) Normalisation des IDs

```typescript
// Replace old ID (email) with participant_id for consistency
updatedContributors = r.contributors.map(c =>
  c.userId === oldUserId
    ? {
        ...c,
        userId: participantId, // ✅ Normalize to participant_id
        quantity: updatedContribution.quantity,
        contributedAt: updatedContribution.createdAt,
      }
    : c
);
```

#### d) Rollback en cas d'erreur

```typescript
setResources(prev => {
  previousResources = [...prev]; // Capture dans le setState
  return prev.map(/* ... */);
});

// En cas d'erreur
if (previousResources.length > 0) {
  setResources(previousResources);
}
```

### 3. Suppression des dépendances obsolètes

```typescript
// ❌ AVANT
[updateContributionUseCase, getResourcesUseCase, currentEventId, resources][
  // ✅ APRÈS
  (updateContributionUseCase, currentEventId)
];
```

Suppression de `resources` pour éviter les closures avec des valeurs obsolètes.

## Patterns à suivre pour les futures features

### ✅ DO: Mise à jour optimiste ou avec réponse API

Pour toute opération de mutation (POST, PUT, DELETE):

1. **Option A - Optimistic Update** (comme `addContribution`)

   ```typescript
   // Update local state immediately
   setResources(prev => prev.map(/* update */));

   // Call API
   await apiCall();

   // On error: rollback
   ```

2. **Option B - Response-based Update** (comme `updateContribution`)

   ```typescript
   // Call API first
   const updated = await apiCall();

   // Update local state with response
   setResources(prev => prev.map(/* use updated data */));

   // On error: rollback
   ```

### ❌ DON'T: GET après mutation

```typescript
// ❌ N'utilisez PAS ce pattern
await updateSomething();
const allData = await getAllData(); // ← GET inutile
setData(allData);
```

### Pattern de matching multi-stratégies

Quand l'API est incohérente avec les IDs:

```typescript
// Try multiple strategies
let item = items.find(i => i.id === primaryId);
if (!item) item = items.find(i => i.id === secondaryId);
if (!item && items.length === 1) item = items[0];

// Log the inconsistency for debugging
if (!item) {
  console.warn('Could not match item', { primaryId, secondaryId, items });
}
```

### Gestion du state avec rollback

```typescript
const updateSomething = useCallback(
  async () => {
    let previousState = [];

    try {
      setData(prev => {
        previousState = [...prev]; // ✅ Capture in setState
        return prev.map(/* update */);
      });

      await apiCall();
    } catch (err) {
      if (previousState.length > 0) {
        setData(previousState); // ✅ Rollback
      }
      throw err;
    }
  },
  [
    /* no data dependency */
  ]
); // ✅ Remove data from deps
```

## Résultats

### Performance

- ✅ 1 requête HTTP au lieu de 2 (-50%)
- ✅ Temps de réponse perceptible réduit
- ✅ Interface plus fluide

### Fiabilité

- ✅ Gère les 3 types d'identifiants différents
- ✅ Rollback automatique en cas d'erreur
- ✅ Pas de race conditions avec les closures

### Maintenabilité

- ✅ Pattern cohérent avec `addContribution`
- ✅ Code documenté avec commentaires explicites
- ✅ Stratégies de matching clairement identifiées

## Points d'attention pour le futur

### Si l'API backend est corrigée

Quand le backend utilisera un seul type d'identifiant cohérent:

1. Supprimer les strategies 2 et 3 du matching
2. Garder seulement la strategy 1 (participant_id)
3. Nettoyer les commentaires sur l'incohérence

### Si d'autres endpoints ont le même problème

Réutiliser le pattern de matching multi-stratégies:

- Créer une fonction utilitaire `findContributorByAnyId()`
- Centraliser la logique dans un helper

### Migration des contributors

Au fur et à mesure des updates, les `userId` dans les contributors sont normalisés vers `participant_id`. Après quelques semaines d'utilisation, la majorité des contributors auront l'UUID au lieu de l'email.

## Fichiers modifiés

- `src/features/contributions/services/HttpContributionRepository.ts`
- `src/features/resources/hooks/ResourcesProvider.tsx`
- `src/features/resources/components/ResourceItem.tsx` (nettoyage logs)

## Tests

- ✅ Build TypeScript passe
- ✅ Tests unitaires existants passent
- ✅ Test manuel: update contribution fonctionne sans GET
- ✅ Test manuel: rollback en cas d'erreur réseau

## Références

- Issue: Comportement GET non désiré après update
- PR: [À créer si vous utilisez des PRs]
- Related: Pattern similaire dans `addContribution`
