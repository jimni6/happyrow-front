# Create Event Form - Refonte Esthétique

**Date**: 2 février 2026  
**Branch**: (à créer: `feat/design_create_event_form`)  
**Design source**: `design-figma/create new event form.png`

## Objectif

Refonte complète de l'esthétique du formulaire de création d'événement (`CreateEventForm`) pour correspondre au design Figma moderne, tout en conservant toutes les fonctionnalités existantes.

## Changements Implémentés

### 1. Design Tokens

**Fichier**: `src/core/styles/tokens/colors.css`

Ajout d'une nouvelle couleur pour le fond du modal :

```css
--bg-modal-pink: #f5e8e4;
```

### 2. Composant Modal

**Fichiers modifiés**:

- `src/shared/components/Modal/Modal.tsx`
- `src/shared/components/Modal/Modal.css`

#### Nouvelles propriétés

Ajout de deux nouvelles props optionnelles :

- `variant?: 'default' | 'create-event'` - Permet d'appliquer un style prédéfini
- `className?: string` - Permet une personnalisation CSS supplémentaire

#### Nouveau style: Variante `create-event`

- **Fond rose pâle** : `var(--bg-modal-pink)`
- **Titre**: Couleur navy, aligné à gauche, police Comic Neue
- **Bouton de fermeture (×)**:
  - Fond circulaire navy
  - Couleur texte blanche
  - Hover: fond teal
- **Header**: Sans bordure inférieure
- **Padding**: Adapté pour un look plus aéré

### 3. Formulaire CreateEventForm

**Fichier**: `src/features/events/components/CreateEventForm.css`

#### Refonte complète des styles

**Labels**:

- Couleur: `var(--color-navy)` (#3D5A6C)
- Font-weight: `var(--font-bold)`
- Font-size: `var(--text-base)` (20px)
- Margin-bottom: `var(--space-2)` (12px)

**Inputs, Textareas, Selects**:

- Bordure: 3px solid `var(--color-navy)`
- Border-radius: `var(--radius-3xl)` (20px)
- Padding: `var(--space-3)` `var(--space-4)` (16px 24px)
- Background: `var(--bg-primary)` (blanc)
- Font-size: `var(--text-base)` (20px)

**État Focus**:

- Border-color: `var(--color-teal)` (#5FBDB4)
- Box-shadow: `0 0 0 3px rgba(95, 189, 180, 0.2)`

**Bouton Submit ("Create")**:

- Width: 100% (pleine largeur)
- Background: `var(--color-navy)`
- Color: white
- Border-radius: `var(--radius-3xl)` (20px)
- Padding: `var(--space-3)` `var(--space-5)` (16px 32px)
- Font-size: `var(--text-lg)` (24px)
- Font-weight: `var(--font-bold)`
- Hover: Background devient `var(--color-teal)`

**Bouton Cancel**:

- Masqué via `display: none` (conforme au design Figma)

### 4. Utilisation dans HomeView

**Fichier**: `src/features/home/views/HomeView.tsx`

Le Modal utilise maintenant la variante `create-event` :

```tsx
<Modal
  isOpen={isCreateEventModalOpen}
  onClose={() => {...}}
  title="Create new event"
  size="medium"
  variant="create-event"
>
```

**Changement du titre**: "Create New Event" → "Create new event" (conforme au design)

## Fonctionnalités Conservées

✅ Tous les champs existants sont conservés :

- **Name** (Nom de l'événement)
- **Description** (Description)
- **Date** (Date de l'événement)
- **Time** (Heure de l'événement)
- **Place** (Lieu)
- **Event Type** (Type: Party, Birthday, Diner, Snack)

✅ Validation complète du formulaire
✅ Gestion des erreurs
✅ États loading/disabled
✅ Responsive design (mobile-first)

## Fonctionnalités Reportées

🔜 **Section "Add participants"**

Le design Figma montre une section avec des avatars circulaires et un bouton "+" pour ajouter des participants. Cette fonctionnalité sera implémentée dans une future PR.

**Raison du report**: Focus sur la refonte esthétique d'abord, fonctionnalité de gestion des participants ensuite.

## Design Tokens Utilisés

### Couleurs

- `--color-navy`: #3D5A6C (labels, bordures, bouton principal)
- `--color-teal`: #5FBDB4 (focus, hover)
- `--bg-modal-pink`: #F5E8E4 (fond du modal)
- `--bg-primary`: white (fond des inputs)

### Espacements

- `--space-2`: 12px (label margin-bottom)
- `--space-3`: 16px (input padding vertical, gap)
- `--space-4`: 24px (margin-bottom entre champs, padding horizontal)
- `--space-5`: 32px (padding bouton, margin-top actions)

### Bordures

- `--radius-3xl`: 20px (coins arrondis inputs et bouton)
- `--radius-full`: 50% (bouton fermeture circulaire)

### Typographie

- `--font-sans`: 'Comic Neue' (police principale)
- `--text-base`: 20px (labels, inputs)
- `--text-lg`: 24px (bouton submit)
- `--font-bold`: 700 (labels, bouton)

### Ombres

- `--shadow-md`: 0 4px 15px rgba(0, 0, 0, 0.1) (bouton)
- `--shadow-lg`: 0 8px 25px rgba(0, 0, 0, 0.15) (bouton hover)

## Responsive Design

### Mobile (< 768px)

- Labels: `font-size: var(--text-sm)` (18px)
- Inputs: `font-size: var(--text-sm)`, padding réduit
- Bouton: `font-size: var(--text-base)` (20px)

### Tablette/Desktop

- Grid layout pour Date/Time (2 colonnes)
- Conserve les tailles de texte complètes

## Tests Manuels Effectués

✅ Compilation TypeScript sans erreurs  
✅ Linting ESLint sans erreurs  
✅ Serveur de développement démarre correctement  
✅ Pas d'erreurs de console

### Tests visuels recommandés

- [ ] Le formulaire correspond visuellement au design Figma
- [ ] Tous les champs fonctionnent correctement
- [ ] La validation d'erreur s'affiche bien
- [ ] Le bouton Create est stylé correctement
- [ ] Responsive sur mobile (< 768px)
- [ ] Responsive sur tablette (768px - 1200px)
- [ ] Le bouton de fermeture (×) fonctionne
- [ ] Les états hover fonctionnent (inputs, bouton)
- [ ] Les états focus fonctionnent (inputs)

## Compatibilité

Cette refonte n'impacte **pas** les autres modals de l'application grâce au système de variantes. Les modals existants continuent d'utiliser la variante `default`.

## Prochaines Étapes

1. Tester visuellement dans le navigateur
2. Ajuster si nécessaire les espacements/couleurs
3. Implémenter la section "Add participants" (future PR)
4. Créer la branche et commit les changements

## Fichiers Modifiés

1. `src/core/styles/tokens/colors.css` - Nouveau token couleur
2. `src/shared/components/Modal/Modal.tsx` - Props variant et className
3. `src/shared/components/Modal/Modal.css` - Styles variante create-event
4. `src/features/events/components/CreateEventForm.css` - Refonte complète
5. `src/features/home/views/HomeView.tsx` - Utilisation nouvelle variante

## Architecture Decision Records

### Pourquoi une variante et non un modal dédié ?

**Décision**: Ajouter une prop `variant` au Modal existant plutôt que créer un nouveau composant `CreateEventModal`.

**Raisons**:

1. **Réutilisabilité**: Le composant Modal reste générique
2. **Maintenance**: Un seul composant à maintenir
3. **Évolutivité**: Facile d'ajouter d'autres variantes à l'avenir
4. **Cohérence**: Tous les modals utilisent la même structure de base

### Pourquoi masquer le bouton Cancel ?

**Décision**: `display: none` sur le bouton Cancel plutôt que le supprimer du code.

**Raisons**:

1. Le design Figma ne montre pas de bouton Cancel
2. Le bouton de fermeture (×) suffit pour annuler
3. On garde le code pour rétrocompatibilité éventuelle
4. Facile de le réactiver si besoin

## Notes de Développement

- La police **Comic Neue** est déjà configurée dans le projet
- Les design tokens sont tous documentés dans `src/core/styles/tokens/`
- Le composant Modal est utilisé dans plusieurs endroits : attention à ne pas casser l'existant
- Le formulaire conserve toute sa logique métier (validation, soumission)
