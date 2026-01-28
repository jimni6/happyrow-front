# 5. ARCHITECTURE LOGICIELLE COMPLÈTE

## 5.1 Vue d'ensemble de l'architecture full-stack

### 5.1.1 Architecture globale

HappyRow adopte une architecture **full-stack moderne** avec deux composants distincts mais complémentaires :

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (NAVIGATEUR)                          │
│                 Chrome, Firefox, Safari, Edge                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTPS (TLS 1.3)
                           │ Content-Type: application/json
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            FRONTEND - HappyRow Front                            │
│              React 19 + TypeScript 5.8                          │
│              Hébergement: Vercel (Edge CDN)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ARCHITECTURE FEATURE-DRIVEN                             │  │
│  │                                                           │  │
│  │  features/                                               │  │
│  │  ├── auth/         (Authentification Supabase)          │  │
│  │  │   ├── components/  (LoginForm, RegisterForm)        │  │
│  │  │   ├── use-cases/   (SignInUser, RegisterUser)       │  │
│  │  │   ├── services/    (SupabaseAuthRepository)         │  │
│  │  │   └── hooks/       (useAuth, useAuthActions)        │  │
│  │  │                                                       │  │
│  │  ├── events/       (Gestion événements)                │  │
│  │  │   ├── components/  (CreateEventForm, EventList)     │  │
│  │  │   ├── use-cases/   (CreateEvent, GetEvents)         │  │
│  │  │   ├── services/    (HttpEventRepository)            │  │
│  │  │   └── views/       (EventDetailsView)               │  │
│  │  │                                                       │  │
│  │  ├── participants/ (Gestion participants)              │  │
│  │  ├── resources/    (Gestion ressources)                │  │
│  │  └── contributions/(Gestion contributions)             │  │
│  │                                                           │  │
│  │  shared/          (Composants partagés: Modal, etc.)    │  │
│  │  layouts/         (AppHeader, AppLayout)                │  │
│  │  core/            (Configuration, styles globales)      │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ REST API (JSON)
                           │ Authorization: Bearer <JWT>
                           │ x-user-id: <creator-id>
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND - HappyRow Core                              │
│              Kotlin 2.2 + Ktor 3.2                              │
│              Hébergement: Render (Platform as a Service)        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ARCHITECTURE HEXAGONALE (PORTS & ADAPTERS)             │  │
│  │                                                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  INFRASTRUCTURE - DRIVING (Adapters entrants)      │  │  │
│  │  │  - EventEndpoints (Ktor routes)                    │  │  │
│  │  │  - ParticipantEndpoints                            │  │  │
│  │  │  - DTO Mapping (JSON ↔ Domain)                     │  │  │
│  │  │  - Error Handling (HTTP status codes)              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                           │                               │  │
│  │                           ▼                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  DOMAIN (Cœur métier - Ports)                      │  │  │
│  │  │                                                     │  │  │
│  │  │  Entities:                                         │  │  │
│  │  │  - Event (id, name, date, location, type)         │  │  │
│  │  │  - Participant (id, userId, eventId, status)      │  │  │
│  │  │  - Resource, Contribution                          │  │  │
│  │  │                                                     │  │  │
│  │  │  Use Cases:                                        │  │  │
│  │  │  - CreateEventUseCase                              │  │  │
│  │  │  - GetEventsByOrganizerUseCase                     │  │  │
│  │  │  - UpdateEventUseCase, DeleteEventUseCase          │  │  │
│  │  │                                                     │  │  │
│  │  │  Ports (Interfaces):                               │  │  │
│  │  │  - EventRepository                                 │  │  │
│  │  │  - ParticipantRepository                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                           │                               │  │
│  │                           ▼                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  INFRASTRUCTURE - DRIVEN (Adapters sortants)       │  │  │
│  │  │  - SqlEventRepository (Exposed ORM)                │  │  │
│  │  │  - SqlParticipantRepository                        │  │  │
│  │  │  - Database Tables (EventTable, ParticipantTable)  │  │  │
│  │  │  - Transaction Management                          │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ SQL (SSL/TLS)
                           │ HikariCP Connection Pool
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│            BASE DE DONNÉES PostgreSQL 15                        │
│            Hébergement: Render Managed Database                 │
│                                                                 │
│  Schema: configuration                                          │
│  Tables:                                                        │
│  - event (id, name, description, event_date, creator, ...)     │
│  - participant (id, user_id, event_id, status)                 │
│  - resource (id, event_id, name, quantity, type)               │
│  - contribution (id, participant_id, resource_id, quantity)    │
│                                                                 │
│  Contraintes:                                                   │
│  - PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK                      │
│  - Transactions ACID                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│         SERVICE EXTERNE - Supabase Auth                         │
│                                                                 │
│  - Gestion utilisateurs (users table)                           │
│  - Génération JWT tokens                                        │
│  - Validation JWT (backend)                                     │
│  - user_metadata (firstname, lastname)                          │
└─────────────────────────────────────────────────────────────────┘
```

**Compétences CDA démontrées** :

- **CDA-2.1** : Concevoir une application organisée en couches
- **CDA-2.2** : Développer une application en couches

---

## 5.2 Architecture Backend - Hexagonale

### 5.2.1 Principe de l'architecture hexagonale

L'architecture hexagonale (ou **Ports & Adapters**) garantit :

- **Indépendance du framework** : Le domaine ne dépend pas de Ktor
- **Testabilité** : Mock facile des repositories
- **Maintenabilité** : Séparation claire des responsabilités
- **Évolutivité** : Changement d'infrastructure sans impact métier

### 5.2.2 Couches backend

#### Couche Domain (Cœur métier)

**Responsabilités** :

- Définir les entités métier (Event, Participant, etc.)
- Implémenter la logique métier (Use Cases)
- Définir les ports (interfaces de repositories)

**Règles** :

- ❌ Pas de dépendance vers l'infrastructure
- ❌ Pas de dépendance vers Ktor, Exposed, etc.
- ✅ Code métier pur, testable unitairement
- ✅ Dépendances uniquement vers Kotlin stdlib et Arrow

**Exemple - Entité Event** :

```kotlin
package com.happyrow.core.domain.event.common.model.event

import java.time.Instant
import java.util.UUID

data class Event(
    val identifier: UUID,
    val name: String,
    val description: String,
    val eventDate: Instant,
    val creationDate: Instant,
    val updateDate: Instant,
    val creator: Creator,
    val location: String,
    val type: EventType,
    val members: List<String>
)

enum class EventType {
    PARTY, BIRTHDAY, DINER, SNACK
}
```

**Exemple - Use Case** :

```kotlin
package com.happyrow.core.domain.event.create

import arrow.core.Either
import arrow.core.flatMap
import com.happyrow.core.domain.event.common.driven.event.EventRepository
import com.happyrow.core.domain.event.common.model.event.Event

class CreateEventUseCase(
    private val eventRepository: EventRepository,
    private val participantRepository: ParticipantRepository,
) {
    fun create(request: CreateEventRequest): Either<CreateEventException, Event> =
        eventRepository.create(request)
            .mapLeft { CreateEventException(request, it) }
            .flatMap { event ->
                // Règle métier: créateur = participant confirmé automatiquement
                val creatorId = UUID.fromString(request.creator.toString())
                participantRepository.create(
                    CreateParticipantRequest(
                        userId = creatorId,
                        eventId = event.identifier,
                        status = ParticipantStatus.CONFIRMED,
                    ),
                )
                    .map { event }
                    .mapLeft { CreateEventException(request, it) }
            }
}
```

#### Couche Infrastructure Driving (Adapters entrants)

**Responsabilités** :

- Exposer l'API REST (Ktor)
- Recevoir les requêtes HTTP
- Mapper DTO → Domain
- Appeler les Use Cases
- Mapper Domain → DTO
- Gérer les erreurs HTTP

**Exemple - Endpoint** :

```kotlin
fun Route.createEventEndpoint(createEventUseCase: CreateEventUseCase) = route("") {
    post {
        Either.catch { call.receive<CreateEventRequestDto>() }
            .mapLeft { BadRequestException.InvalidBodyException(it) }
            .flatMap { requestDto ->
                call.getHeader(CREATOR_HEADER).map { requestDto.toDomain(it) }
            }
            .flatMap { request -> createEventUseCase.create(request) }
            .map { it.toDto() }
            .fold(
                { it.handleFailure(call) },
                { call.respond(HttpStatusCode.Created, it) },
            )
    }
}
```

#### Couche Infrastructure Driven (Adapters sortants)

**Responsabilités** :

- Implémenter les repositories (interfaces du domain)
- Communiquer avec PostgreSQL via Exposed ORM
- Gérer les transactions
- Mapper Database → Domain

**Exemple - Repository** :

```kotlin
class SqlEventRepository(private val database: Database) : EventRepository {
    override fun create(request: CreateEventRequest): Either<CreateEventRepositoryException, Event> =
        Either.catch {
            transaction(database) {
                val eventId = UUID.randomUUID()
                EventTable.insert {
                    it[identifier] = eventId
                    it[name] = request.name
                    it[description] = request.description
                    it[eventDate] = request.eventDate
                    it[creator] = request.creator.identifier
                    it[location] = request.location
                    it[type] = request.type
                }
                // Map ResultRow → Event
                EventTable.select { EventTable.identifier eq eventId }
                    .single()
                    .toEvent()
            }
        }.mapLeft { CreateEventRepositoryException(request, it) }
}
```

### 5.2.3 Injection de dépendances (Koin)

**Configuration Koin** :

```kotlin
val domainModule = module {
    single { CreateEventUseCase(get(), get()) }
    single { GetEventsByOrganizerUseCase(get()) }
    // ...
}

val infrastructureModule = module {
    single<EventRepository> { SqlEventRepository(get()) }
    single<ParticipantRepository> { SqlParticipantRepository(get()) }
    single { ExposedDatabase() }
}
```

**Compétences CDA démontrées** :

- **CDA-2.1** : Architecture en couches
- **CDA-1.2** : Développer des composants métier (Use Cases)
- **CDA-2.3** : Développer composants d'accès aux données (Repositories)

---

## 5.3 Architecture Frontend - Feature-Driven

### 5.3.1 Principe de l'architecture feature-driven

L'architecture par features organise le code par **fonctionnalités métier** plutôt que par type technique :

**Avantages** :

- ✅ Code co-localisé (tout pour une feature au même endroit)
- ✅ Scalabilité (ajout de features sans impact)
- ✅ Réutilisabilité claire (shared/ vs feature-specific)
- ✅ Travail en parallèle facilité (features indépendantes)
- ✅ Ownership claire (équipe = feature)

### 5.3.2 Structure des features

Chaque feature suit la même structure :

```
features/events/
├── components/       # Composants UI React
│   ├── CreateEventForm.tsx
│   ├── EventCard.tsx
│   └── EventList.tsx
├── hooks/           # Hooks personnalisés
│   └── useEvents.ts
├── services/        # Repositories (communication API)
│   └── HttpEventRepository.ts
├── types/           # Types et interfaces TypeScript
│   ├── Event.ts
│   └── EventRepository.ts
├── use-cases/       # Logique métier
│   ├── CreateEvent.ts
│   ├── GetEvents.ts
│   └── DeleteEvent.ts
├── views/           # Écrans principaux
│   └── EventDetailsView.tsx
└── index.ts         # Barrel export
```

### 5.3.3 Couches frontend

#### Couche Présentation (Components + Views)

**Responsabilités** :

- Afficher l'UI
- Gérer les événements utilisateur
- Appeler les use cases
- Afficher les états (loading, error, success)

**Exemple - Composant formulaire** :

```tsx
export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({...});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    // Validation côté client
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters';
    }
    // ... autres validations
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
      date: new Date(`${formData.date}T${formData.time}`),
      location: formData.location.trim(),
      type: formData.type as EventType,
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
};
```

#### Couche Application (Use Cases)

**Responsabilités** :

- Encapsuler la logique métier
- Valider les données
- Appeler les repositories
- Gérer les erreurs

**Exemple - Use Case** :

```typescript
export class CreateEvent {
  constructor(private eventRepository: EventRepository) {}

  async execute(request: CreateEventRequest): Promise<Event> {
    // Validation métier
    this.validate(request);

    try {
      const event = await this.eventRepository.create({
        name: request.name,
        description: request.description,
        eventDate: request.date.toISOString(),
        location: request.location,
        type: request.type,
        organizerId: request.organizerId,
      });
      return event;
    } catch (error) {
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  private validate(request: CreateEventRequest): void {
    if (request.date <= new Date()) {
      throw new Error('Event date must be in the future');
    }
    // ... autres validations
  }
}
```

#### Couche Infrastructure (Repositories)

**Responsabilités** :

- Communiquer avec l'API backend
- Gérer l'authentification JWT
- Mapper DTO ↔ Domain
- Gérer les erreurs réseau

**Exemple - Repository HTTP** :

```typescript
export class HttpEventRepository implements EventRepository {
  private baseUrl: string;
  private getAccessToken: () => string | null;

  constructor(getAccessToken: () => string | null) {
    this.baseUrl = `${apiConfig.baseUrl}/events`;
    this.getAccessToken = getAccessToken;
  }

  async create(dto: CreateEventDTO): Promise<Event> {
    const token = this.getAccessToken();
    if (!token) throw new Error('No access token');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    }

    const data = await response.json();
    return this.mapToEvent(data);
  }

  private mapToEvent(dto: any): Event {
    return {
      id: dto.identifier,
      name: dto.name,
      description: dto.description,
      date: new Date(dto.event_date),
      location: dto.location,
      type: dto.type,
      organizerId: dto.creator?.identifier,
      // ...
    };
  }
}
```

#### Gestion d'état (Context API)

**AuthContext pour l'authentification globale** :

```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authRepository,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial user
    // Subscribe to auth changes
    const unsubscribe = authRepository.onAuthStateChange(
      (newUser, newSession) => {
        setUser(newUser);
        setSession(newSession);
      }
    );
    return () => unsubscribe();
  }, [authRepository]);

  const value = { user, session, loading, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

**Compétences CDA démontrées** :

- **CDA-1.1** : Développer des interfaces utilisateur (Components)
- **CDA-1.2** : Développer des composants métier (Use Cases TypeScript)
- **CDA-2.3** : Développer l'accès aux données (HTTP Repositories)

---

## 5.4 Communication Backend ↔ Frontend

### 5.4.1 Protocole REST API + JWT

**Format des échanges** : JSON  
**Authentification** : JWT (Bearer token)  
**Transport** : HTTPS obligatoire

### 5.4.2 Flow d'authentification

```
┌─────────┐                 ┌──────────┐              ┌──────────┐
│ Frontend│                 │ Supabase │              │  Backend │
└────┬────┘                 └─────┬────┘              └─────┬────┘
     │                            │                         │
     │ 1. SignUp/SignIn          │                         │
     │─────────────────────────>│                         │
     │                            │                         │
     │ 2. JWT Token              │                         │
     │<─────────────────────────│                         │
     │                            │                         │
     │ 3. API Request + Bearer Token                      │
     │────────────────────────────────────────────────────>│
     │                            │                         │
     │                            │ 4. Validate JWT        │
     │                            │<────────────────────────│
     │                            │                         │
     │                            │ 5. Token Valid         │
     │                            │─────────────────────────>│
     │                            │                         │
     │ 6. Response (JSON)                                  │
     │<────────────────────────────────────────────────────│
```

### 5.4.3 Exemple de requête complète

**Frontend envoie** :

```http
POST https://happyrow-core.onrender.com/event/configuration/api/v1/events
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Anniversaire Marie",
  "description": "Fête des 30 ans",
  "event_date": "2026-12-25T18:00:00Z",
  "location": "Paris",
  "type": "BIRTHDAY"
}
```

**Backend répond** :

```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "identifier": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "name": "Anniversaire Marie",
  "description": "Fête des 30 ans",
  "event_date": "2026-12-25T18:00:00Z",
  "creation_date": "2026-01-07T10:30:00Z",
  "update_date": "2026-01-07T10:30:00Z",
  "creator": {
    "identifier": "user@email.com"
  },
  "location": "Paris",
  "type": "BIRTHDAY",
  "members": []
}
```

**Compétences CDA démontrées** :

- **CDA-3.3** : Sécuriser les données lors des échanges (HTTPS, JWT)

---

## Conclusion de la section 5

L'architecture de HappyRow combine deux approches modernes et complémentaires :

✅ **Backend : Architecture hexagonale** pour découplage et testabilité  
✅ **Frontend : Architecture feature-driven** pour scalabilité  
✅ **Communication : REST API + JWT** sécurisée  
✅ **Séparation claire** des responsabilités à tous les niveaux

Cette architecture démontre la maîtrise des compétences CDA **AT2** (Concevoir et développer une application organisée en couches) avec une implémentation professionnelle et maintenable.

**Section suivante** : Réalisations backend (extraits de code Kotlin).
