# Fix: Bouton de suppression d'événement

## Problème initial

Le bouton "Delete Event" n'apparaissait pas dans la vue `EventDetailsView`, même pour le créateur de l'événement.

## Diagnostic

Grâce aux logs de debug, nous avons identifié que :

- Le frontend comparait `user.id` (UUID : `'ab70634a-345e-415e-8417-60841b6bcb20'`)
- Le backend renvoie `creator` avec l'email de l'utilisateur (`'jimmy.ni@hotmail.fr'`)
- Résultat : `isOrganizer` était toujours `false`

## Solution implémentée

### Modification dans `EventDetailsView.tsx`

Changement de la logique de comparaison pour supporter à la fois l'UUID et l'email :

```typescript
// Avant
const isOrganizer = user?.id === currentEvent.organizerId;

// Après
const isOrganizer =
  user?.id === currentEvent.organizerId ||
  user?.email === currentEvent.organizerId;
```

**Raison** : Le backend utilise l'email dans le champ `creator`, donc nous devons comparer avec `user.email`. La double comparaison (UUID || email) assure la compatibilité si le backend change de format à l'avenir.

## Fonctionnalités existantes (non modifiées)

Toute la logique de suppression existait déjà :

1. **Bouton de suppression** (ligne 267-274) : Conditionné par `isOrganizer`
2. **Modal de confirmation** (`ConfirmDeleteModal.tsx`) : Demande confirmation avec le nom de l'événement
3. **Handler de suppression** (`handleDeleteEvent`) : Appelle l'API de suppression
4. **Use-case DeleteEvent** : Validation et logique métier
5. **Repository HTTP** : Appel DELETE à l'API
6. **Styles CSS** : Bouton rouge avec hover effects

## Fichiers modifiés

### `src/features/events/views/EventDetailsView.tsx`

- **Ligne 181** : Ajout de la comparaison avec `user.email`
- Ajout d'un commentaire explicatif

## Tests effectués

✅ Le bouton "Delete Event" apparaît maintenant pour le créateur de l'événement  
✅ Le bouton reste caché pour les autres utilisateurs  
✅ Le modal de confirmation s'ouvre correctement  
✅ La suppression fonctionne via l'API

## Notes techniques

### Format backend vs frontend

- **Backend** : Utilise `creator` (string - email de l'utilisateur)
- **Frontend** : Mappe vers `organizerId` dans l'interface `Event`
- **Mapping** : Effectué dans `HttpEventRepository.ts` (lignes 84, 116, 145, 190)

### Sécurité

La validation côté backend reste nécessaire pour s'assurer que seul le créateur peut supprimer un événement. Le frontend ne fait qu'afficher/masquer l'UI.

## Améliorations possibles (future)

1. **Standardiser l'identifiant** : Le backend devrait idéalement renvoyer l'UUID du créateur plutôt que son email
2. **Type safety** : Créer un type `UserId` pour distinguer UUID vs email
3. **Cohérence** : Uniformiser l'utilisation d'UUID partout dans l'API

## Commit recommandé

```bash
git add src/features/events/views/EventDetailsView.tsx
git commit -m "fix: afficher le bouton de suppression pour le créateur de l'événement

Le backend renvoie l'email dans le champ 'creator' au lieu de l'UUID.
Ajout de la comparaison avec user.email pour supporter ce format."
```
