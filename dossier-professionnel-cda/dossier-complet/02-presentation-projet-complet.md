# 2. PRÉSENTATION DU PROJET HAPPYROW

## 2.1 Vision et objectifs du projet

### 2.1.1 Vision générale

**HappyRow** est une plateforme full-stack moderne conçue pour **simplifier l'organisation d'événements festifs** (anniversaires, soirées, dîners, apéros) en centralisant la gestion des événements, des participants, des ressources et des contributions.

**Mission** : Transformer l'expérience d'organisation d'événements en fournissant une solution complète, intuitive, sécurisée et performante accessible depuis n'importe quel navigateur web.

**Architecture** :

- **Backend (HappyRow Core)** : API REST sécurisée développée en Kotlin/Ktor
- **Frontend (HappyRow Front)** : Application web moderne développée en React/TypeScript

**Valeurs** :

- **Simplicité** : Interface utilisateur intuitive et API cohérente
- **Fiabilité** : Architecture robuste et testée (backend + frontend)
- **Sécurité** : Protection des données utilisateurs (OWASP, RGPD)
- **Performance** : Temps de réponse optimaux et expérience fluide
- **Modernité** : Technologies récentes et bonnes pratiques

---

### 2.1.2 Objectifs du projet

#### Objectifs fonctionnels

**Gestion des événements** :

- ✅ Créer un événement avec informations détaillées (backend + frontend)
- ✅ Consulter les événements par organisateur (backend + frontend)
- ✅ Modifier les informations d'un événement (backend + frontend)
- ✅ Supprimer un événement (backend + frontend)

**Gestion des participants** :

- ✅ Ajouter des participants à un événement
- ✅ Consulter la liste des participants
- ✅ Mettre à jour le statut (confirmé, en attente, refusé)
- ✅ Interface visuelle pour la gestion (frontend)

**Gestion des ressources** :

- ✅ Définir les ressources nécessaires (nourriture, boissons, matériel)
- ✅ Consulter les ressources d'un événement
- ✅ Formulaires de création (frontend)

**Gestion des contributions** :

- ✅ Associer des participants à des ressources (qui apporte quoi)
- ✅ Consulter les contributions
- ✅ Supprimer des contributions

**Authentification et sécurité** :

- ✅ Inscription et connexion utilisateur (Supabase)
- ✅ Authentification JWT avec validation
- ✅ Protection des routes (frontend + backend)
- ✅ Réinitialisation de mot de passe

#### Objectifs techniques

**Backend (HappyRow Core)** :

- ✅ Architecture hexagonale (Clean Architecture)
- ✅ API REST complète et documentée
- ✅ Sécurité OWASP Top 10
- ✅ Tests automatisés (Kotest, Testcontainers)
- ✅ CI/CD GitHub Actions → Render
- ✅ Temps de réponse < 200ms (p95)

**Frontend (HappyRow Front)** :

- ✅ Architecture feature-driven
- ✅ Composants React réutilisables
- ✅ Validation côté client
- ✅ Tests (Vitest, React Testing Library)
- ✅ CI/CD GitHub Actions → Vercel
- ✅ Interface responsive

**Qualité globale** :

- ✅ Code quality : Detekt (backend), ESLint (frontend)
- ✅ Formatage automatique : Spotless (backend), Prettier (frontend)
- ✅ Hooks Git (Husky, lint-staged)
- ✅ Documentation complète

#### Objectifs DevOps

**Infrastructure** :

- ✅ Containerisation Docker (backend + frontend)
- ✅ Déploiement automatique (2 pipelines CI/CD)
- ✅ Hébergement cloud (Render + Vercel)
- ✅ Base de données managée (Render PostgreSQL)
- ✅ Authentification managée (Supabase)

**Monitoring** (prévu) :

- ⚠️ Logs structurés
- ⚠️ Métriques de performance
- ⚠️ Alertes automatiques

---

## 2.2 Périmètre du projet

### 2.2.1 Fonctionnalités incluses (MVP)

#### Backend : HappyRow Core (API REST)

**Module Événements** :

- Création d'événements festifs (4 types : PARTY, BIRTHDAY, DINER, SNACK)
- Champs : nom, description, date, lieu, type, créateur
- Contraintes : nom unique, date future
- CRUD complet (Create, Read, Update, Delete)

**Module Participants** :

- Ajout de participants à un événement
- Statuts : CONFIRMED, PENDING, DECLINED
- Participant créateur automatiquement ajouté (status CONFIRMED)
- Consultation par événement
- Mise à jour du statut

**Module Ressources** :

- Définition des ressources nécessaires pour un événement
- Types : FOOD, DRINK, EQUIPMENT
- Quantité et unité de mesure
- CRUD complet

**Module Contributions** :

- Association participant ↔ ressource
- Quantité promise par le participant
- Ajout et suppression de contributions
- Consultation par événement

#### Frontend : HappyRow Front (Application Web)

**Authentification** :

- ✅ Formulaire d'inscription (firstname, lastname, email, password)
- ✅ Formulaire de connexion
- ✅ Réinitialisation de mot de passe
- ✅ Gestion de session avec Supabase
- ✅ Protection des routes authentifiées

**Dashboard utilisateur** :

- ✅ Page d'accueil personnalisée avec nom de l'utilisateur
- ✅ Affichage des informations du profil
- ✅ Liste des événements créés
- ✅ Accès rapide aux fonctionnalités

**Gestion des événements (UI)** :

- ✅ Formulaire de création d'événement
- ✅ Validation des données côté client
- ✅ Modal réutilisable pour les formulaires
- ✅ Affichage de la liste des événements
- ✅ Vue détaillée d'un événement
- ✅ Modification d'événement
- ✅ Suppression d'événement

**Gestion des participants (UI)** :

- ✅ Formulaire d'ajout de participant
- ✅ Liste des participants d'un événement
- ✅ Mise à jour du statut de participation
- ✅ Affichage visuel des statuts (badges colorés)

---

### 2.2.2 Fonctionnalités exclues (hors périmètre MVP)

**Gestion des invitations** :

- ❌ Pas d'envoi d'emails automatiques
- ❌ Pas de système de notifications push
- 🔄 Prévu pour version 1.5

**Gestion financière** :

- ❌ Pas de gestion des coûts/dépenses
- ❌ Pas de remboursements
- 🔄 Intégration future possible (type Tricount)

**Messagerie** :

- ❌ Pas de chat entre participants
- ❌ Pas de commentaires sur événements
- 🔄 Prévu pour version 2.0

**Calendrier** :

- ❌ Pas d'intégration Google Calendar/iCal
- ❌ Pas de synchronisation
- 🔄 Prévu pour version 2.0

**Application mobile** :

- ❌ Pas d'application mobile native
- ✅ Application web responsive (mobile-friendly)
- 🔄 Kotlin Multiplatform prévu pour 2026

---

## 2.3 Architecture générale

### 2.3.1 Vue d'ensemble de l'architecture full-stack

```
┌──────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR WEB                            │
│                   (Chrome, Firefox, Safari)                  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND - HappyRow Front                       │
│                  (Vercel - CDN)                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  React 19 + TypeScript                                 │  │
│  │  - Composants UI (formulaires, listes, modals)        │  │
│  │  - Use Cases (validation métier)                      │  │
│  │  - HTTP Repositories (communication API)              │  │
│  │  - Context API (gestion d'état)                       │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ REST API (JSON)
                         │ Authorization: Bearer JWT
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              BACKEND - HappyRow Core                         │
│                   (Render - PaaS)                            │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Kotlin 2.2 + Ktor 3.2                                │  │
│  │  - Endpoints REST (driving adapters)                  │  │
│  │  - Use Cases (logique métier)                         │  │
│  │  - Repositories (driven adapters)                     │  │
│  │  - Exposed ORM (accès données)                        │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ SQL (SSL/TLS)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│           BASE DE DONNÉES PostgreSQL 15                      │
│                (Render Managed Database)                     │
│  - Tables : event, participant, resource, contribution       │
│  - Contraintes : UNIQUE, CHECK, FOREIGN KEY                 │
│  - Transactions ACID                                         │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│         AUTHENTIFICATION - Supabase Auth                     │
│  - Gestion des utilisateurs                                  │
│  - JWT tokens (signing + validation)                         │
│  - Réinitialisation de mot de passe                         │
└──────────────────────────────────────────────────────────────┘
```

### 2.3.2 Communication Backend ↔ Frontend

**Protocole** : REST API avec authentification JWT

**Flow d'authentification** :

1. **Inscription/Connexion** → Frontend appelle Supabase Auth
2. **Token JWT** ← Supabase renvoie le token
3. **Requêtes API** → Frontend envoie `Authorization: Bearer {token}`
4. **Validation** → Backend valide le token avec Supabase
5. **Réponse** ← Backend renvoie les données

**Exemple de requête** :

```typescript
// Frontend (TypeScript)
const response = await fetch('https://happyrow-core.onrender.com/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  },
  body: JSON.stringify(eventData),
});
```

### 2.3.3 Architecture backend (Hexagonale)

**Couches** :

- **Domain** : Entités, Use Cases, Ports (interfaces)
- **Infrastructure Driving** : Endpoints REST (Ktor)
- **Infrastructure Driven** : Repositories (Exposed ORM)

**Avantages** :

- Indépendance du framework
- Testabilité maximale
- Séparation des responsabilités

### 2.3.4 Architecture frontend (Feature-Driven)

**Organisation par features** :

- `features/auth/` : Authentification
- `features/events/` : Gestion événements
- `features/participants/` : Gestion participants
- `features/contributions/` : Gestion contributions
- `features/resources/` : Gestion ressources
- `features/home/` : Dashboard

**Chaque feature contient** :

- `components/` : Composants UI React
- `hooks/` : Hooks personnalisés
- `services/` : Repositories HTTP
- `types/` : Interfaces TypeScript
- `use-cases/` : Logique métier
- `views/` : Écrans principaux

**Avantages** :

- Code co-localisé
- Scalabilité
- Réutilisabilité
- Travail en parallèle facilité

---

## 2.4 Technologies et stack technique

### 2.4.1 Stack backend

| Couche              | Technologie | Version | Justification                          |
| ------------------- | ----------- | ------- | -------------------------------------- |
| **Langage**         | Kotlin      | 2.2.0   | Type-safe, moderne, interopérable Java |
| **Framework**       | Ktor        | 3.2.2   | Léger, performant, Kotlin-first        |
| **ORM**             | Exposed     | 0.61.0  | Type-safe DSL, intégration Kotlin      |
| **Base de données** | PostgreSQL  | 15      | Robuste, ACID, relationnel             |
| **DI**              | Koin        | 4.1.0   | Simple, Kotlin-native                  |
| **FP**              | Arrow       | 2.1.2   | Programmation fonctionnelle (Either)   |
| **Tests**           | Kotest      | 5.9.1   | BDD, framework moderne                 |
| **Mocking**         | MockK       | 1.14.5  | Mocking natif Kotlin                   |
| **Logs**            | Logback     | 1.5.18  | Standard, configurable                 |

### 2.4.2 Stack frontend

| Couche              | Technologie           | Version | Justification                        |
| ------------------- | --------------------- | ------- | ------------------------------------ |
| **Framework**       | React                 | 19.1.1  | Library UI moderne, large communauté |
| **Langage**         | TypeScript            | 5.8.3   | Type-safety, meilleure DX            |
| **Build**           | Vite                  | 7.1.2   | Rapide, HMR performant               |
| **Auth**            | Supabase              | 2.39.3  | Auth managée, JWT intégré            |
| **Tests**           | Vitest                | 3.2.4   | Compatible Vite, rapide              |
| **Testing Library** | React Testing Library | 16.3.0  | Tests orientés utilisateur           |
| **Linter**          | ESLint                | 9.33.0  | Qualité du code                      |
| **Formatter**       | Prettier              | 3.6.2   | Formatage cohérent                   |

### 2.4.3 Stack DevOps et qualité

| Domaine              | Technologie    | Backend          | Frontend         |
| -------------------- | -------------- | ---------------- | ---------------- |
| **Containerisation** | Docker         | ✅ Multi-stage   | ✅ Multi-stage   |
| **CI/CD**            | GitHub Actions | ✅ Deploy Render | ✅ Deploy Vercel |
| **Hébergement**      | Cloud PaaS     | Render           | Vercel           |
| **Qualité code**     | Linters        | Detekt           | ESLint           |
| **Formatage**        | Formatters     | Spotless         | Prettier         |
| **Git hooks**        | Husky          | ✅ Backend       | ✅ Frontend      |
| **Couverture**       | Coverage       | JaCoCo           | Vitest           |
| **Tests containers** | Testcontainers | ✅ PostgreSQL    | ❌               |

---

## 2.5 Livrables du projet

### 2.5.1 Livrables techniques

**Backend** :

- ✅ Repository GitHub : https://github.com/jimni6/happyrow-core
- ✅ API REST déployée : https://happyrow-core.onrender.com
- ✅ Documentation API (collection Postman)
- ✅ Tests automatisés (Kotest)
- ✅ Pipeline CI/CD fonctionnel

**Frontend** :

- ✅ Repository GitHub : https://github.com/jimni6/happyrow-front
- ✅ Application déployée : https://happyrow-front.vercel.app
- ✅ Interface utilisateur responsive
- ✅ Tests automatisés (Vitest)
- ✅ Pipeline CI/CD fonctionnel

**Documentation** :

- ✅ README complets (backend + frontend)
- ✅ Documentation d'architecture (ARCHITECTURE.md)
- ✅ Guide de déploiement (DEPLOYMENT.md)
- ✅ Documentation de sécurité (SECURITY.md)

### 2.5.2 Livrables pédagogiques

**Dossier professionnel CDA** :

- ✅ Sections détaillées (~50 pages)
- ✅ Schémas et diagrammes UML
- ✅ Extraits de code commentés (backend + frontend)
- ✅ Jeux d'essai détaillés
- ✅ Veille technologique
- ✅ Annexes (max 40 pages)

**Présentation orale** :

- Slides de support (prévu)
- Démonstration live (backend + frontend)
- Réponses aux questions du jury

### 2.5.3 Métriques de succès

**Métriques fonctionnelles** :

| Métrique              | Objectif  | Backend | Frontend |
| --------------------- | --------- | ------- | -------- |
| Endpoints implémentés | 12+       | ✅ 12   | ✅ N/A   |
| CRUD complets         | 4 modules | ✅ 4    | ✅ 4     |
| Fonctionnalités UI    | 8+        | ❌ N/A  | ✅ 10    |
| Cas d'usage couverts  | 100% MVP  | ✅ 100% | ✅ 100%  |

**Métriques techniques** :

| Métrique                 | Objectif | Backend     | Frontend    |
| ------------------------ | -------- | ----------- | ----------- |
| Temps de réponse (p95)   | < 200ms  | ✅ ~150ms   | ✅ < 100ms  |
| Issues qualité           | 0        | ✅ 0 Detekt | ✅ 0 ESLint |
| Couverture tests         | ≥ 80%    | ⚠️ En cours | ⚠️ En cours |
| Vulnérabilités critiques | 0        | ✅ 0        | ✅ 0        |
| Uptime production        | ≥ 95%    | ✅ ~98%     | ✅ ~99%     |

---

## Conclusion de la section 2

Le projet **HappyRow** est une solution full-stack moderne et complète qui démontre la maîtrise des compétences CDA sur l'ensemble du cycle de développement :

✅ **Frontend** : Interfaces utilisateur React modernes et responsives  
✅ **Backend** : API REST sécurisée et performante  
✅ **Architecture** : Clean Architecture (backend) + Feature-Driven (frontend)  
✅ **Sécurité** : OWASP Top 10, JWT, RGPD  
✅ **Tests** : Automatisés (Kotest + Vitest)  
✅ **DevOps** : CI/CD double pipeline, déploiement cloud

Le projet est **en production** et accessible publiquement, démontrant une capacité à livrer une application professionnelle complète et fonctionnelle.

**Section suivante** : Cahier des charges et spécifications détaillées.
