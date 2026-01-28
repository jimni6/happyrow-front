# 4. CAHIER DES CHARGES

## 4.1 Expression des besoins fonctionnels

### 4.1.1 Vue d'ensemble

**HappyRow** doit permettre à des utilisateurs authentifiés de :

1. Créer et gérer des événements festifs
2. Inviter et gérer des participants
3. Définir les ressources nécessaires
4. Organiser les contributions de chacun

**Périmètre** : MVP (Minimum Viable Product) pour validation CDA  
**Approche** : Full-stack (API REST backend + Application web frontend)

---

### 4.1.2 Besoins utilisateurs

#### UC-01 : Authentification et gestion de compte

**En tant qu'utilisateur**, je veux :

- ✅ M'inscrire avec email, mot de passe, prénom, nom
- ✅ Me connecter avec mes identifiants
- ✅ Réinitialiser mon mot de passe si oublié
- ✅ Me déconnecter en toute sécurité
- ✅ Voir mes informations de profil

**Interfaces concernées** :

- Frontend : Formulaires d'inscription, connexion, reset password
- Backend : API authentification via Supabase

**Critères d'acceptation** :

- Validation des emails (format)
- Mots de passe sécurisés (≥ 8 caractères)
- Prénom et nom (≥ 2 caractères)
- Session maintenue tant que token valide
- Déconnexion propre (suppression token)

---

#### UC-02 : Création d'événements

**En tant qu'organisateur**, je veux :

- ✅ Créer un événement avec nom, description, date, lieu, type
- ✅ Être automatiquement ajouté comme participant confirmé
- ✅ Voir tous mes événements créés
- ✅ Modifier les informations d'un événement
- ✅ Supprimer un événement si nécessaire

**Interfaces concernées** :

- Frontend : Formulaire de création avec validation, liste d'événements
- Backend : POST /events, GET /events, PUT /events/:id, DELETE /events/:id

**Règles métier** :

- Nom unique par événement
- Date dans le futur
- Types autorisés : PARTY, BIRTHDAY, DINER, SNACK
- Créateur = participant confirmé automatiquement

**Critères d'acceptation** :

- Formulaire avec validation temps réel
- Messages d'erreur explicites
- Confirmation visuelle de création
- Liste mise à jour immédiatement

---

#### UC-03 : Gestion des participants

**En tant qu'organisateur**, je veux :

- ✅ Ajouter des participants à mon événement
- ✅ Voir la liste des participants
- ✅ Modifier le statut d'un participant (CONFIRMED, PENDING, DECLINED)
- ✅ Retirer un participant si nécessaire

**Interfaces concernées** :

- Frontend : Liste participants avec badges de statut, formulaire d'ajout
- Backend : POST /participants, GET /participants, PUT /participants/:id/status

**Règles métier** :

- Organisateur ne peut pas être retiré
- Statuts possibles : CONFIRMED, PENDING, DECLINED
- Un participant = un user ID

**Critères d'acceptation** :

- Badges colorés par statut
- Mise à jour visuelle immédiate
- Confirmation avant suppression

---

#### UC-04 : Gestion des ressources

**En tant qu'organisateur**, je veux :

- ✅ Définir les ressources nécessaires (nourriture, boissons, matériel)
- ✅ Spécifier quantité et unité de mesure
- ✅ Voir toutes les ressources d'un événement
- ✅ Modifier ou supprimer une ressource

**Interfaces concernées** :

- Frontend : Formulaire ressources (prévu)
- Backend : POST /resources, GET /resources, PUT /resources/:id, DELETE /resources/:id

**Règles métier** :

- Types : FOOD, DRINK, EQUIPMENT
- Quantité > 0
- Unité de mesure obligatoire

---

#### UC-05 : Gestion des contributions

**En tant qu'organisateur ou participant**, je veux :

- ✅ Indiquer ce que j'apporte (contribution)
- ✅ Associer ma contribution à une ressource
- ✅ Voir qui apporte quoi
- ✅ Modifier ou annuler ma contribution

**Interfaces concernées** :

- Frontend : Interface contributions (prévu)
- Backend : POST /contributions, GET /contributions, DELETE /contributions/:id

**Règles métier** :

- Participant + Ressource = Contribution
- Quantité promise ≤ quantité requise
- Un participant peut contribuer à plusieurs ressources

---

### 4.1.3 Besoins non fonctionnels

#### Performance

| Critère                        | Objectif | Mesuré    |
| ------------------------------ | -------- | --------- |
| **Temps de réponse API** (p95) | < 200ms  | ✅ ~150ms |
| **Temps de chargement page**   | < 2s     | ✅ ~1s    |
| **Disponibilité**              | ≥ 95%    | ✅ ~98%   |
| **Concurrent users**           | ≥ 50     | ✅ OK     |

#### Sécurité

| Aspect               | Exigence              | Implémentation           |
| -------------------- | --------------------- | ------------------------ |
| **Authentification** | JWT sécurisé          | ✅ Supabase Auth         |
| **Transport**        | HTTPS obligatoire     | ✅ SSL/TLS               |
| **Base de données**  | Connexion chiffrée    | ✅ SSL PostgreSQL        |
| **Injection SQL**    | Protection 100%       | ✅ ORM Exposed           |
| **CORS**             | Liste blanche         | ✅ Configuration stricte |
| **Validation**       | Côté client + serveur | ✅ Double validation     |
| **OWASP Top 10**     | Conformité            | ✅ 8/10 traités          |

#### Qualité

| Critère                       | Objectif    | Mesuré                 |
| ----------------------------- | ----------- | ---------------------- |
| **Couverture tests backend**  | ≥ 80%       | 🔄 En cours            |
| **Couverture tests frontend** | ≥ 80%       | 🔄 En cours            |
| **Issues qualité (Detekt)**   | 0           | ✅ 0                   |
| **Issues qualité (ESLint)**   | 0           | ✅ 0                   |
| **Formatage**                 | Automatique | ✅ Spotless + Prettier |

#### Maintenabilité

| Aspect            | Exigence         | Implémentation                 |
| ----------------- | ---------------- | ------------------------------ |
| **Architecture**  | Clean & scalable | ✅ Hexagonale + Feature-driven |
| **Documentation** | Complète         | ✅ README, ARCHITECTURE.md     |
| **Code review**   | Systematic       | ✅ Self-review + Git           |
| **Versioning**    | Sémantique       | ✅ Git tags                    |

#### Compatibilité

**Backend** :

- JDK 21+
- PostgreSQL 15+
- Compatible containers Docker

**Frontend** :

- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design (mobile, tablet, desktop)
- Support tactile

---

## 4.2 Contraintes techniques

### 4.2.1 Contraintes d'architecture

**Backend** :

- ✅ Architecture hexagonale stricte
- ✅ Séparation Domain/Infrastructure
- ✅ Pas de logique métier dans les endpoints
- ✅ Injection de dépendances (Koin)

**Frontend** :

- ✅ Architecture feature-driven
- ✅ Composants réutilisables
- ✅ Séparation Use Cases / Repositories / UI
- ✅ TypeScript strict mode

**Communication** :

- ✅ REST API avec JSON
- ✅ Authentification JWT (Bearer token)
- ✅ CORS configuré pour production

---

### 4.2.2 Contraintes de sécurité

#### Backend

**Obligatoire** :

- ✅ HTTPS en production
- ✅ Connexion PostgreSQL SSL/TLS
- ✅ Validation des entrées (DTO)
- ✅ Paramétrage SQL (ORM)
- ✅ Gestion d'erreurs sécurisée (pas de stack trace exposée)
- ✅ Variables d'environnement pour secrets

**Recommandé** :

- Rate limiting (à implémenter)
- Headers de sécurité (CSP, X-Frame-Options)
- Rotation des secrets

#### Frontend

**Obligatoire** :

- ✅ Validation côté client
- ✅ Pas de secrets dans le code
- ✅ Tokens en mémoire uniquement
- ✅ XSS prevention (React auto-escape)
- ✅ HTTPS obligatoire

**Recommandé** :

- Content Security Policy stricte
- Subresource Integrity (SRI)

---

### 4.2.3 Contraintes de déploiement

**Backend (Render)** :

- Build automatisé via Dockerfile
- Variables d'environnement configurées
- PostgreSQL managé attaché
- Healthcheck endpoint configuré

**Frontend (Vercel)** :

- Build Vite automatique
- Variables d'environnement Vercel
- CDN Edge Network
- Compression et cache activés

**CI/CD** :

- Tests automatiques avant déploiement
- Lint et formatage obligatoires
- Déploiement automatique sur merge main

---

## 4.3 Planning et jalons

### 4.3.1 Méthodologie

**Approche** : Agile Scrum (adapté solo)

- Sprints de 2 semaines
- Backlog priorisé (Trello)
- Rétrospectives hebdomadaires
- Déploiement continu

### 4.3.2 Macro-planning

| Phase                      | Durée      | Période        | Livrables                             |
| -------------------------- | ---------- | -------------- | ------------------------------------- |
| **Phase 1 : Backend**      | 8 semaines | Août-Sept 2025 | API REST complète, tests, déploiement |
| **Phase 2 : Frontend**     | 6 semaines | Oct-Nov 2025   | Application web, auth, événements     |
| **Phase 3 : Intégration**  | 2 semaines | Déc 2025       | Backend ↔ Frontend, tests E2E        |
| **Phase 4 : Finalisation** | 2 semaines | Janv 2026      | Documentation, dossier CDA            |

### 4.3.3 Jalons détaillés

#### Sprint 1-4 : Backend Core (Août-Septembre)

**Sprint 1** : Architecture et authentification

- ✅ Setup projet Gradle multi-modules
- ✅ Architecture hexagonale
- ✅ Intégration Supabase Auth (validation JWT)
- ✅ Configuration PostgreSQL

**Sprint 2** : Module Événements

- ✅ Entité Event
- ✅ Use Cases (Create, Get, Update, Delete)
- ✅ Repositories Exposed
- ✅ Endpoints REST

**Sprint 3** : Module Participants + Ressources

- ✅ Entité Participant + Resource
- ✅ Use Cases
- ✅ Endpoints REST
- ✅ Relations événements

**Sprint 4** : Tests et qualité

- ✅ Tests unitaires (Kotest)
- ✅ Tests d'intégration (Testcontainers)
- ✅ Detekt + Spotless
- ✅ CI/CD GitHub Actions

#### Sprint 5-7 : Frontend (Octobre-Novembre)

**Sprint 5** : Setup et authentification

- ✅ Setup Vite + React + TypeScript
- ✅ Architecture feature-driven
- ✅ Authentification Supabase (frontend)
- ✅ Formulaires inscription/connexion

**Sprint 6** : Gestion événements UI

- ✅ Composant CreateEventForm
- ✅ Liste événements
- ✅ Vue détaillée événement
- ✅ Modal réutilisable

**Sprint 7** : Participants et finitions

- ✅ Composant ParticipantList
- ✅ Ajout/modification participants
- ✅ Tests Vitest
- ✅ Responsive design

#### Sprint 8 : Intégration et tests (Décembre)

- ✅ Tests d'intégration frontend ↔ backend
- ✅ Correction bugs
- ✅ Optimisation performance
- ✅ Tests de charge

#### Sprint 9 : Documentation et CDA (Janvier)

- 🔄 Dossier professionnel CDA
- 🔄 Slides de présentation
- 🔄 Préparation soutenance
- ✅ Mise à jour README

---

## 4.4 Gestion des risques

### 4.4.1 Risques identifiés

| ID     | Risque                          | Probabilité | Impact | Mitigation                                   |
| ------ | ------------------------------- | ----------- | ------ | -------------------------------------------- |
| **R1** | Expiration plans gratuits       | Moyenne     | Élevé  | Migration vers plans payants si nécessaire   |
| **R2** | Bugs Supabase Auth              | Faible      | Élevé  | Fallback auth custom prévu dans architecture |
| **R3** | Performance Render (cold start) | Élevée      | Moyen  | Keepalive ping ou migration                  |
| **R4** | Complexité architecture         | Moyenne     | Moyen  | Documentation et tests                       |
| **R5** | Deadline CDA serrée             | Moyenne     | Élevé  | Planning agile flexible                      |

### 4.4.2 Plan de secours

**Si Render trop lent** :

- Alternative : Railway, Fly.io
- Coût : ~5-10€/mois

**Si Supabase Auth problématique** :

- Implementation JWT custom (backend)
- Utilisation de bibliothèque JWT Kotlin

**Si dépassement de temps** :

- Réduction du périmètre (contributions en v2)
- Focus sur compétences CDA essentielles

---

## 4.5 Livrables attendus

### 4.5.1 Livrables techniques

**Backend** :

- ✅ Code source (GitHub)
- ✅ API REST déployée et accessible
- ✅ Tests automatisés
- ✅ Pipeline CI/CD
- ✅ Documentation API (Postman)

**Frontend** :

- ✅ Code source (GitHub)
- ✅ Application web déployée
- ✅ Tests automatisés
- ✅ Pipeline CI/CD
- ✅ Interface responsive

### 4.5.2 Livrables documentaires

**Dossier professionnel CDA** :

- 🔄 Dossier principal (40-60 pages)
- 🔄 Annexes (max 40 pages)
- 🔄 Code source commenté
- 🔄 Captures d'écran
- 🔄 Diagrammes UML

**Présentation orale** :

- 🔄 Slides (PowerPoint/PDF)
- 🔄 Démonstration live
- 🔄 Réponses aux questions jury

---

## 4.6 Critères de validation

### 4.6.1 Validation fonctionnelle

| Critère                        | Validation                                                |
| ------------------------------ | --------------------------------------------------------- |
| **Tous les endpoints backend** | ✅ 12 endpoints implémentés                               |
| **CRUD complets**              | ✅ 4 modules (Event, Participant, Resource, Contribution) |
| **Authentification**           | ✅ Inscription, connexion, reset password                 |
| **Interfaces utilisateur**     | ✅ Formulaires, listes, détails                           |
| **Responsive design**          | ✅ Mobile, tablet, desktop                                |

### 4.6.2 Validation technique

| Critère               | Validation                        |
| --------------------- | --------------------------------- |
| **Tests automatisés** | 🔄 Backend + Frontend             |
| **Qualité code**      | ✅ 0 issue Detekt, 0 issue ESLint |
| **Sécurité**          | ✅ OWASP, JWT, HTTPS              |
| **CI/CD**             | ✅ 2 pipelines fonctionnels       |
| **Déploiement**       | ✅ Render + Vercel                |

### 4.6.3 Validation CDA

**Toutes les compétences démontrées** :

- ✅ AT1.1 - Développer interfaces utilisateur
- ✅ AT1.2 - Développer composants métier
- ✅ AT2.1 - Concevoir architecture en couches
- ✅ AT2.2 - Développer accès aux données
- ✅ AT3.1 - Préparer et exécuter tests
- ✅ AT3.2 - Préparer déploiement sécurisé
- ✅ AT3.3 - Contribuer à DevOps

---

## Conclusion de la section 4

Le cahier des charges définit un périmètre **clair et réaliste** pour le projet HappyRow, avec :

✅ **Besoins fonctionnels** bien identifiés et priorisés  
✅ **Contraintes techniques** respectées (architecture, sécurité)  
✅ **Planning réaliste** avec jalons clairement définis  
✅ **Risques anticipés** avec plans de mitigation  
✅ **Critères de validation** mesurables

Le projet répond aux **exigences du référentiel CDA** tout en démontrant une capacité à concevoir, planifier et réaliser un projet full-stack complet.

**Section suivante** : Gestion de projet et méthodologie.
