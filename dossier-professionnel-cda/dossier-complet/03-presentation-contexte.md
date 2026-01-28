# 3. PRÉSENTATION DU CONTEXTE ET DE L'ENTREPRISE

## 3.1 Contexte du projet

### 3.1.1 Cadre de réalisation

Ce projet a été réalisé dans le cadre de l'obtention du titre professionnel **Concepteur Développeur d'Applications (CDA)**, niveau 6 (équivalent Bac+3/4), enregistré au RNCP sous le code RNCP37873.

**Type de projet** : Projet de formation professionnelle full-stack  
**Durée** : 6 mois (Août 2025 - Janvier 2026)  
**Statut** : Projet personnel en autonomie complète  
**Environnement** : Télétravail avec outils professionnels

**Composants du projet** :

- **Backend** : API REST sécurisée (Kotlin/Ktor)
- **Frontend** : Application web moderne (React/TypeScript)
- **Déploiement** : Production sur Render (backend) et Vercel (frontend)

---

### 3.1.2 Origine du projet

**Problématique identifiée** :

L'organisation d'événements festifs (anniversaires, soirées, dîners entre amis) implique plusieurs défis récurrents :

1. **Coordination difficile** : Multiples échanges par SMS, email, WhatsApp
2. **Gestion des participants** : Difficile de suivre qui vient, qui apporte quoi
3. **Organisation des ressources** : Nourriture, boissons, matériel à coordonner
4. **Répartition des coûts** : Calculs manuels, oublis, conflits
5. **Manque de centralisation** : Informations éparpillées, perte de messages

**Besoin identifié** :

Une solution centralisée permettant de :

- Créer et gérer des événements festifs
- Inviter et suivre les participants
- Organiser les contributions (qui apporte quoi)
- Faciliter la communication entre participants
- Simplifier l'organisation collective

**Solution apportée** :

HappyRow est une plateforme full-stack qui centralise toute la gestion d'événements festifs avec :

- Une **API REST backend** robuste et sécurisée
- Une **application web frontend** moderne et intuitive
- Une **authentification sécurisée** (JWT via Supabase)
- Des **interfaces utilisateur** responsives

---

### 3.1.3 Public cible

**Profil des utilisateurs** :

- **Organisateurs** : Personnes souhaitant organiser un événement festif
- **Participants** : Invités aux événements
- **Âge** : 18-50 ans (population active)
- **Compétences techniques** : Utilisation courante d'applications web/mobile
- **Contexte d'utilisation** : Personnel, loisirs, vie sociale

**Cas d'usage typiques** :

1. Marie organise son anniversaire (30 ans) avec 25 invités
2. Un groupe d'amis planifie un apéro mensuel
3. Une famille organise un dîner de Noël avec contributions
4. Des collègues préparent une soirée de départ

---

## 3.2 Environnement de développement

### 3.2.1 Organisation du travail

**Statut** : Développeur indépendant (projet personnel)

**Modalités de travail** :

- Télétravail à 100%
- Autonomie complète dans les décisions techniques
- Gestion de projet en méthodologie Agile (Scrum adapté)
- Itérations de 2 semaines (sprints)

**Outils de collaboration** :

- **GitHub** : Gestion du code source (2 repositories), issues, pull requests
- **Trello** : Gestion des tâches et du backlog
- **Notion** : Documentation technique et décisions architecturales
- **Discord** : Participation aux communautés Kotlin/Ktor et React

---

### 3.2.2 Infrastructure technique

#### Backend - HappyRow Core

| Composant           | Outil/Version                 |
| ------------------- | ----------------------------- |
| **OS**              | macOS Sonoma 14.5             |
| **IDE**             | IntelliJ IDEA Ultimate 2024.3 |
| **JDK**             | OpenJDK 21 (Temurin)          |
| **Build tool**      | Gradle 8.5                    |
| **VCS**             | Git 2.42                      |
| **Terminal**        | iTerm2 + Zsh                  |
| **API Testing**     | Postman, Insomnia             |
| **Database client** | DBeaver 23.3.0                |

#### Frontend - HappyRow Front

| Composant            | Outil/Version                    |
| -------------------- | -------------------------------- |
| **OS**               | macOS Sonoma 14.5                |
| **IDE**              | IntelliJ IDEA Ultimate / VS Code |
| **Node**             | Node.js 20 LTS                   |
| **Package manager**  | npm 10                           |
| **VCS**              | Git 2.42                         |
| **Browser DevTools** | Chrome DevTools                  |
| **Testing**          | Vitest + React Testing Library   |

#### Environnement d'hébergement

| Composant            | Service                                                |
| -------------------- | ------------------------------------------------------ |
| **Backend API**      | Render (Platform as a Service)                         |
| **Frontend App**     | Vercel (Edge Network)                                  |
| **Base de données**  | Render PostgreSQL (managed)                            |
| **Authentification** | Supabase Auth (managed)                                |
| **CI/CD**            | GitHub Actions (2 pipelines)                           |
| **Domaines**         | happyrow-core.onrender.com + happyrow-front.vercel.app |

---

### 3.2.3 Budget et ressources

**Budget alloué** : 0 € (services gratuits)

**Services utilisés** :

| Service                | Plan  | Coût mensuel | Usage                        |
| ---------------------- | ----- | ------------ | ---------------------------- |
| **Render Web Service** | Free  | 0 €          | Hébergement backend API      |
| **Render PostgreSQL**  | Free  | 0 €          | Base de données (1 GB)       |
| **Vercel**             | Hobby | 0 €          | Hébergement frontend         |
| **Supabase**           | Free  | 0 €          | Authentification (50k users) |
| **GitHub**             | Free  | 0 €          | Code source + CI/CD          |

**Contraintes liées aux plans gratuits** :

- Render : Mise en veille après 15 min d'inactivité (démarrage ~30s)
- PostgreSQL : Limite de 1 GB de stockage
- Vercel : Limite de 100 GB de bande passante
- Supabase : 50,000 utilisateurs actifs mensuels
- Pas de backup automatique
- Pas de support technique premium

**Stratégie d'optimisation** :

- Utilisation de plans gratuits pour le développement et les tests
- Migration vers plans payants si passage en production réelle
- Architecture prévue pour scalabilité future

---

## 3.3 Veille et préparation du projet

### 3.3.1 Étude de l'existant

**Solutions concurrentes analysées** :

#### 1. Doodle

- **Avantages** : Planification de dates, sondages
- **Limites** : Pas de gestion de ressources, pas de contributions
- **Positionnement** : Complémentaire (focus sur les dates)

#### 2. WhatsApp / Messenger

- **Avantages** : Omniprésent, discussions de groupe
- **Limites** : Pas structuré, perte d'informations, pas de suivi
- **Positionnement** : Outil de communication adjacent

#### 3. Tricount

- **Avantages** : Excellent pour les dépenses partagées
- **Limites** : Pas de gestion d'événements, focus uniquement financier
- **Positionnement** : Complémentaire (focus sur les coûts)

#### 4. Facebook Events

- **Avantages** : Large base d'utilisateurs, visibilité
- **Limites** : Dépendance à Facebook, pas de gestion fine des contributions
- **Positionnement** : Alternatif (événements publics)

**Différenciation de HappyRow** :

- ✅ Spécialisé dans les événements festifs privés
- ✅ Gestion intégrée : événements + participants + ressources + contributions
- ✅ Architecture moderne full-stack (API REST + React)
- ✅ Architecture découplée (backend/frontend indépendants)
- ✅ Open source et hébergement contrôlé
- ✅ Interface utilisateur moderne et responsive

---

### 3.3.2 Choix technologiques préliminaires

**Critères de sélection** :

1. **Performance** : Temps de réponse < 200ms
2. **Maintenabilité** : Code propre, architecture claire
3. **Sécurité** : Standards OWASP, protection des données
4. **Scalabilité** : Capacité à gérer la croissance
5. **Productivité** : Frameworks matures, documentation
6. **Coût** : Solutions open source privilégiées

#### Technologies backend retenues

| Domaine             | Technologie   | Justification                           |
| ------------------- | ------------- | --------------------------------------- |
| **Langage**         | Kotlin 2.2    | Type-safe, moderne, interopérable Java  |
| **Framework web**   | Ktor 3.2      | Léger, performant, Kotlin-first         |
| **Base de données** | PostgreSQL 15 | Robuste, ACID, open source              |
| **ORM**             | Exposed 0.61  | Type-safe, intégration Kotlin           |
| **Architecture**    | Hexagonale    | Découplage, testabilité, maintenabilité |

#### Technologies frontend retenues

| Domaine          | Technologie    | Justification                                 |
| ---------------- | -------------- | --------------------------------------------- |
| **Framework**    | React 19       | Library moderne, large communauté             |
| **Langage**      | TypeScript 5.8 | Type-safety, meilleure expérience développeur |
| **Build**        | Vite 7         | Ultra-rapide, HMR performant                  |
| **Auth**         | Supabase       | Auth managée, JWT intégré                     |
| **Architecture** | Feature-driven | Scalabilité, organisation claire              |

---

### 3.3.3 Compétences mobilisées

**Compétences techniques backend** :

- ✅ Programmation orientée objet (Kotlin)
- ✅ Programmation fonctionnelle (Arrow)
- ✅ Architecture logicielle (Clean Architecture, DDD)
- ✅ API REST (conception, implémentation, documentation)
- ✅ Base de données relationnelles (SQL, modélisation)
- ✅ Tests automatisés (unitaires, intégration)
- ✅ DevOps (Docker, CI/CD, déploiement cloud)
- ✅ Sécurité applicative (OWASP, RGPD)

**Compétences techniques frontend** :

- ✅ Développement d'interfaces utilisateur (React)
- ✅ TypeScript et programmation typée
- ✅ Gestion d'état (Context API, hooks)
- ✅ Communication API REST (fetch, JWT)
- ✅ Tests UI (Vitest, React Testing Library)
- ✅ Responsive design et accessibilité
- ✅ Build et déploiement (Vite, Vercel)

**Compétences transversales** :

- ✅ Gestion de projet Agile (Scrum)
- ✅ Documentation technique
- ✅ Veille technologique
- ✅ Résolution de problèmes complexes
- ✅ Autonomie et prise d'initiative
- ✅ Communication écrite (README, documentation)

---

## 3.4 Cadre légal et conformité

### 3.4.1 Propriété intellectuelle

**Statut du projet** : Open source (prévu)

**Licence envisagée** : MIT License

- Utilisation libre (commerciale ou non)
- Modification et redistribution autorisées
- Pas de garantie

**Code source** :

- Backend : https://github.com/jimni6/happyrow-core
- Frontend : https://github.com/jimni6/happyrow-front

---

### 3.4.2 Protection des données (RGPD)

**Données personnelles collectées** :

- Emails (identifiant utilisateur)
- Noms et prénoms des utilisateurs
- Noms des événements et descriptions
- Localisation des événements

**Bases légales** :

- **Consentement** : Création de compte volontaire
- **Intérêt légitime** : Organisation d'événements

**Principes appliqués** :

- ✅ Minimisation : Seules les données nécessaires
- ✅ Transparence : Information claire sur l'utilisation
- ✅ Limitation de la durée : Suppression après inactivité (prévu)
- ✅ Sécurité : Chiffrement en transit (SSL/TLS)
- ✅ Authentification sécurisée : JWT via Supabase

**Droits des utilisateurs** (prévus) :

- Droit d'accès aux données
- Droit de rectification
- Droit à l'effacement ("droit à l'oubli")
- Droit à la portabilité

---

### 3.4.3 Accessibilité et inclusivité

**RGAA (Référentiel Général d'Amélioration de l'Accessibilité)** :

**Backend API** :

- Messages d'erreur explicites
- Structure JSON cohérente
- Documentation complète

**Frontend** :

- Labels associés aux inputs
- Messages d'erreur visibles
- Navigation au clavier
- Contraste de couleurs suffisant
- Structure sémantique HTML5

**Objectif futur** : Frontend conforme RGAA niveau AA.

---

## 3.5 Objectifs professionnels

### 3.5.1 Objectifs pédagogiques

Ce projet vise à démontrer la maîtrise des compétences du référentiel CDA :

**Activité Type 1** : Développer une application sécurisée

- Développer des interfaces utilisateur (React)
- Développer des composants métier (Use Cases backend + frontend)
- Développer la persistance des données (PostgreSQL, ORM)

**Activité Type 2** : Concevoir et développer une application organisée en couches

- Concevoir une base de données relationnelle
- Développer des composants d'accès aux données (Repositories)
- Mettre en place une architecture en couches (hexagonale + feature-driven)

**Activité Type 3** : Préparer le déploiement sécurisé

- Préparer et exécuter les tests (Kotest + Vitest)
- Préparer le déploiement (Docker, CI/CD)
- Sécuriser l'application (OWASP, JWT, CORS)

**Compétence transversale** : Effectuer une veille technologique

---

### 3.5.2 Objectifs techniques

**Court terme (projet CDA)** :

- ✅ API REST fonctionnelle et sécurisée
- ✅ Application web React moderne
- ✅ Architecture Clean (backend) + Feature-driven (frontend)
- ✅ Authentification JWT via Supabase
- ✅ Déploiement automatisé (2 pipelines CI/CD)
- ✅ Tests et qualité de code
- ✅ Documentation complète

**Moyen terme (après CDA)** :

- Application mobile (Kotlin Multiplatform)
- Notifications en temps réel (WebSocket)
- Gestion des rôles et permissions avancée
- Intégration calendrier (Google, iCal)

**Long terme (évolution du projet)** :

- Architecture microservices si nécessaire
- Intelligence artificielle (recommandations)
- Messagerie entre participants
- Gestion financière (type Tricount)

---

### 3.5.3 Objectifs de carrière

**Compétences visées pour le marché** :

- ✅ Maîtrise full-stack (backend + frontend)
- ✅ Kotlin/Ktor et React/TypeScript
- ✅ Expertise en architecture logicielle moderne
- ✅ Pratique DevOps (CI/CD, containerisation)
- ✅ Sécurité applicative (OWASP, RGPD, JWT)
- ✅ Méthodologie Agile en autonomie

**Débouchés professionnels** :

- Développeur Full Stack
- Concepteur Développeur d'Applications
- Ingénieur Logiciel
- Tech Lead / Architecte logiciel (avec expérience)

**Valeur ajoutée du projet** :

- Projet complet de A à Z en production
- Code source public (portfolio GitHub)
- Démonstration de compétences variées (backend + frontend)
- Capacité à travailler en autonomie
- Application réelle accessible en ligne

---

## Conclusion de la section 3

Ce projet **HappyRow** s'inscrit dans le cadre de l'obtention du titre professionnel CDA. Il répond à un **besoin réel** d'organisation d'événements festifs tout en démontrant la maîtrise de **compétences techniques et professionnelles** variées sur l'ensemble de la stack (backend + frontend).

Le contexte de **développement en autonomie complète** a permis de prendre des **décisions architecturales** justifiées, d'appliquer les **bonnes pratiques** de l'industrie (OWASP, RGPD, DevOps) et de mener un projet de **A à Z** jusqu'à la mise en production sur deux plateformes cloud distinctes.

**Section suivante** : Cahier des charges détaillé.
