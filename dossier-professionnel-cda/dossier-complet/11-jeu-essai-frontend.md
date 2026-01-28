# 11. JEU D'ESSAI - FRONTEND (Interface Utilisateur)

## 11.1 Fonctionnalité testée

### 11.1.1 Fonctionnalité choisie : Création d'événement via UI

**Interface** : Formulaire de création d'événement (modal)

**Description** :
Cette fonctionnalité permet à un utilisateur authentifié de créer un nouvel événement via une interface graphique moderne. Elle met en œuvre l'ensemble de la stack frontend (composants React, validation, use cases, repositories HTTP, communication API).

**Justification du choix** :

- ✅ Fonctionnalité centrale de l'application
- ✅ Couvre toute la stack frontend (UI → Use Case → Repository → API)
- ✅ Illustre la validation côté client
- ✅ Démontre la gestion d'état et des erreurs
- ✅ Représente les compétences CDA frontend

---

### 11.1.2 Architecture de la fonctionnalité

```
┌──────────────────────────────────────────────────────────┐
│  UTILISATEUR                                              │
│  (Clic sur "Create Event" → Remplit formulaire)          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Click / Input events
                     ▼
┌──────────────────────────────────────────────────────────┐
│  COMPOSANT UI - CreateEventForm.tsx                      │
│  - Gestion état formulaire (useState)                    │
│  - Validation côté client (validateForm)                 │
│  - Gestion erreurs (setErrors)                           │
│  - Feedback visuel (loading, success, error)             │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ onSubmit({ name, date, location, type })
                     ▼
┌──────────────────────────────────────────────────────────┐
│  USE CASE - CreateEvent.ts                               │
│  - Validation métier (date future, longueurs)            │
│  - Enrichissement données (organizerId)                  │
│  - Appel repository                                      │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ repository.create(dto)
                     ▼
┌──────────────────────────────────────────────────────────┐
│  REPOSITORY - HttpEventRepository.ts                     │
│  - Construction requête HTTP                             │
│  - Ajout JWT token (Authorization header)               │
│  - Envoi requête POST /events                            │
│  - Mapping réponse API → Event domain                    │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ fetch('https://happyrow-core.onrender.com/api/events')
                     ▼
┌──────────────────────────────────────────────────────────┐
│  BACKEND API                                             │
│  - Validation JWT                                        │
│  - Traitement par backend (voir section 10)             │
│  - Retour 201 Created + Event JSON                       │
└──────────────────────────────────────────────────────────┘
```

---

## 11.2 Jeux de tests détaillés

### 11.2.1 Test 1 : Création d'événement valide (Cas nominal)

#### Objectif

Vérifier que la création d'un événement avec des données valides fonctionne de bout en bout (UI → API).

#### Préconditions

- Utilisateur authentifié (JWT token valide)
- Connexion internet active
- Backend API accessible

#### Étapes manuelles

1. **Accès au formulaire**
   - Se connecter à https://happyrow-front.vercel.app
   - Cliquer sur le bouton "Create Event" dans le dashboard

2. **Remplissage du formulaire**
   - **Event Name** : `Anniversaire de Marie`
   - **Description** : `Fête d'anniversaire pour les 30 ans de Marie`
   - **Event Date** : `25/12/2026`
   - **Event Time** : `19:00`
   - **Location** : `15 rue de la Paix, 75002 Paris`
   - **Event Type** : Sélectionner `Birthday` dans le dropdown

3. **Validation visuelle avant soumission**
   - Aucun message d'erreur affiché
   - Tous les champs remplis correctement
   - Bouton "Create Event" actif

4. **Soumission**
   - Cliquer sur "Create Event"
   - Observer le bouton passer à "Creating..." (état loading)

#### Résultats attendus

**Comportement visuel** :

- ✅ Bouton désactivé pendant la création
- ✅ Texte bouton change en "Creating..."
- ✅ Modal se ferme automatiquement après succès
- ✅ Événement apparaît dans la liste des événements
- ✅ Pas de message d'erreur affiché

**Données affichées** :

- Nom : "Anniversaire de Marie"
- Date : "December 25, 2026 at 7:00 PM"
- Type : Badge "Birthday" avec icône 🎂
- Location : "15 rue de la Paix, 75002 Paris"

**Requête réseau (DevTools)** :

```http
POST https://happyrow-core.onrender.com/event/configuration/api/v1/events
Authorization: Bearer eyJhbG...
Content-Type: application/json

{
  "name": "Anniversaire de Marie",
  "description": "Fête d'anniversaire pour les 30 ans de Marie",
  "event_date": "2026-12-25T18:00:00.000Z",
  "location": "15 rue de la Paix, 75002 Paris",
  "type": "BIRTHDAY"
}
```

**Réponse API** :

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "identifier": "a1b2c3d4-...",
  "name": "Anniversaire de Marie",
  "description": "Fête d'anniversaire pour les 30 ans de Marie",
  "event_date": "2026-12-25T18:00:00.000Z",
  ...
}
```

#### Résultats obtenus

**Validation manuelle** : ✅ SUCCÈS

- Modal se ferme correctement
- Événement visible dans la liste immédiatement
- Données correctement affichées
- Temps de création : ~1.5 secondes (incluant cold start backend)
- Aucune erreur console JavaScript

**Captures d'écran** :

- Screenshot 1 : Formulaire rempli avant soumission
- Screenshot 2 : État loading du bouton
- Screenshot 3 : Liste avec nouvel événement

#### Analyse

✅ **Test réussi** : La fonctionnalité fonctionne de bout en bout

**Points positifs** :

- Validation côté client efficace
- Feedback visuel clair (loading state)
- Gestion d'erreur réseau robuste
- Interface responsive

**Observations** :

- Légère latence due au cold start Render (~500ms)
- Modal fermeture instantanée après succès
- Pas de rechargement de page nécessaire

---

### 11.2.2 Test 2 : Validation des champs obligatoires

#### Objectif

Vérifier que la validation côté client empêche la soumission de données invalides.

#### Étapes manuelles

1. Ouvrir le formulaire de création
2. Cliquer directement sur "Create Event" sans remplir les champs
3. Observer les messages d'erreur

#### Résultats attendus

**Messages d'erreur affichés** :

- ❌ "Event name must be at least 3 characters long"
- ❌ "Description must be at least 3 characters long"
- ❌ "Location must be at least 3 characters long"
- ❌ "Please select an event type"
- ❌ "Event date is required"
- ❌ "Event time is required"

**Comportement** :

- ✅ Formulaire non soumis
- ✅ Pas d'appel API effectué (vérifié dans Network tab)
- ✅ Champs en erreur ont une bordure rouge
- ✅ Focus automatique sur le premier champ en erreur

#### Résultats obtenus

**Validation manuelle** : ✅ SUCCÈS

- Tous les messages d'erreur s'affichent correctement
- Pas d'appel réseau (économie de ressources)
- Border rouge sur inputs invalides
- UX cohérente

**Screenshot** : Formulaire avec erreurs de validation

#### Analyse

✅ **Test réussi** : Validation côté client fonctionne correctement

**Avantages** :

- Feedback immédiat pour l'utilisateur
- Pas de requête API inutile
- Messages d'erreur clairs et exploitables

---

### 11.2.3 Test 3 : Date dans le passé (Validation métier)

#### Objectif

Vérifier que la validation métier empêche la création d'événements passés.

#### Étapes manuelles

1. Remplir tous les champs correctement
2. Sélectionner une date passée : `01/01/2020`
3. Soumettre le formulaire

#### Résultats attendus

**Message d'erreur** :

- ❌ "Event date and time must be in the future"

**Comportement** :

- Validation se déclenche avant la soumission
- Pas d'appel API
- Champ date en erreur (bordure rouge)

#### Résultats obtenus

**Validation manuelle** : ✅ SUCCÈS

- Message d'erreur affiché correctement
- Validation se fait au moment du blur OU de la soumission
- Pas d'appel réseau effectué

**Screenshot** : Erreur date passée

#### Analyse

✅ **Test réussi** : Validation métier côté client opérationnelle

**Points positifs** :

- Validation avant appel API (économie)
- Message clair pour l'utilisateur
- UX cohérente avec les autres validations

---

### 11.2.4 Test 4 : Champs trop courts (Validation longueur)

#### Objectif

Vérifier la validation des longueurs minimales.

#### Étapes manuelles

1. Remplir les champs avec des valeurs trop courtes :
   - Name : `ab` (< 3 caractères)
   - Description : `t` (< 3 caractères)
   - Location : `Pa` (< 3 caractères)
2. Soumettre

#### Résultats attendus

**Messages d'erreur** :

- ❌ "Event name must be at least 3 characters long"
- ❌ "Description must be at least 3 characters long"
- ❌ "Location must be at least 3 characters long"

#### Résultats obtenus

**Validation manuelle** : ✅ SUCCÈS

- Tous les messages affichés
- Validation temps réel (au fur et à mesure de la frappe)
- Erreurs disparaissent quand champs deviennent valides

**Screenshot** : Erreurs longueur minimale

---

### 11.2.5 Test 5 : Erreur réseau (Backend indisponible)

#### Objectif

Vérifier la gestion des erreurs réseau.

#### Étapes manuelles

1. Simuler backend indisponible (DevTools → Offline mode)
2. Remplir formulaire valide
3. Soumettre

#### Résultats attendus

**Message d'erreur** :

- ❌ "Failed to create event: Failed to fetch" ou message similaire
- Toast/notification d'erreur affichée
- Modal reste ouverte
- Formulaire reste rempli (données non perdues)

#### Résultats obtenus

**Validation manuelle** : ✅ SUCCÈS

- Message d'erreur réseau affiché
- Toast d'erreur visible pendant 5 secondes
- Données du formulaire préservées
- Utilisateur peut réessayer

**Screenshot** : Toast erreur réseau

#### Analyse

✅ **Gestion d'erreur robuste**

**Points positifs** :

- Pas de perte de données
- Message d'erreur compréhensible
- Possibilité de retry

---

### 11.2.6 Test 6 : Responsive design (Mobile)

#### Objectif

Vérifier le fonctionnement sur mobile.

#### Étapes manuelles

1. Ouvrir Chrome DevTools
2. Activer mode mobile (iPhone 12 Pro)
3. Créer un événement

#### Résultats attendus

**Comportement** :

- ✅ Modal plein écran sur mobile
- ✅ Champs empilés verticalement
- ✅ Boutons de taille adaptée (44x44px minimum)
- ✅ Clavier virtuel ne masque pas les champs
- ✅ Scroll automatique vers champ en erreur

#### Résultats obtenus

**Validation manuelle** : ✅ SUCCÈS

- Interface parfaitement adaptée
- Tous les champs accessibles
- Navigation tactile fluide
- Pas de problème d'affichage

**Screenshots** :

- Mobile portrait
- Mobile landscape

---

## 11.3 Synthèse des tests frontend

### 11.3.1 Tableau récapitulatif

| Test       | Objectif          | Résultat | Temps    |
| ---------- | ----------------- | -------- | -------- |
| **Test 1** | Création valide   | ✅ PASS  | ~2s      |
| **Test 2** | Validation champs | ✅ PASS  | Immédiat |
| **Test 3** | Date passée       | ✅ PASS  | Immédiat |
| **Test 4** | Longueurs         | ✅ PASS  | Immédiat |
| **Test 5** | Erreur réseau     | ✅ PASS  | ~5s      |
| **Test 6** | Responsive        | ✅ PASS  | ~2s      |

**Taux de réussite** : 6/6 (100%)

### 11.3.2 Compétences CDA démontrées

✅ **CDA-1.1** : Développer des interfaces utilisateur

- Composants React modernes
- Formulaires avec validation
- Feedback visuel (loading, errors)
- Responsive design

✅ **CDA-1.2** : Développer des composants métier

- Use Cases TypeScript
- Validation métier côté client
- Gestion d'état

✅ **CDA-2.3** : Développer l'accès aux données

- HTTP Repository
- Communication REST API
- Mapping DTO

✅ **CDA-3.1** : Préparer et exécuter les tests

- Tests manuels méthodiques
- Cas nominaux et d'erreur
- Documentation des résultats

---

## 11.4 Améliorations identifiées

### Points d'amélioration potentiels

1. **Tests E2E automatisés** (Playwright)
   - Automatiser les tests manuels
   - CI/CD avec tests E2E

2. **Accessibilité**
   - Audit ARIA
   - Support lecteur d'écran complet
   - Navigation clavier améliorée

3. **Performance**
   - Lazy loading des modals
   - Optimisation des re-renders
   - Memoization des composants

4. **UX**
   - Confirmation avant fermeture si formulaire rempli
   - Sauvegarde brouillon (localStorage)
   - Undo/Redo sur les actions

---

## Conclusion de la section 11

Cette section démontre un **processus de test rigoureux** sur le frontend avec :

✅ **Tests manuels méthodiques** couvrant les cas nominaux et d'erreur  
✅ **Validation multicouche** (client + métier + réseau)  
✅ **Gestion d'erreurs robuste** avec feedback utilisateur  
✅ **Responsive design** testé et validé  
✅ **Documentation complète** avec captures d'écran

Les tests prouvent la **qualité professionnelle** de l'interface utilisateur et la maîtrise des compétences CDA frontend.

**Section suivante** : Veille technologique (backend + frontend).
