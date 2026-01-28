# 9. RÉALISATIONS - FRONTEND (React/TypeScript)

Cette section présente les réalisations frontend les plus significatives du projet HappyRow Front, démontrant les compétences CDA en développement d'interfaces utilisateur et de composants métier.

---

## 9.1 Composants d'interface utilisateur (React)

### 9.1.1 Formulaire de création d'événement

**Fichier** : `src/features/events/components/CreateEventForm.tsx`

**Compétences démontrées** :

- **CDA-1.1** : Développer des interfaces utilisateur
- Validation des données côté client
- Gestion des états et des erreurs
- Interface responsive et accessible

**Extrait de code** :

```tsx
import React, { useState } from 'react';
import { EventType } from '../types/Event';

interface CreateEventFormProps {
  onSubmit: (eventData: {
    name: string;
    description: string;
    date: Date;
    location: string;
    type: EventType;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '19:00',
    location: '',
    type: '' as EventType | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation côté client
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Event name must be at least 3 characters long';
    }

    if (
      !formData.description.trim() ||
      formData.description.trim().length < 3
    ) {
      newErrors.description = 'Description must be at least 3 characters long';
    }

    if (!formData.location.trim() || formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters long';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Please select an event type';
    }

    // Validation date/time dans le futur
    if (formData.date && formData.time) {
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      if (selectedDateTime <= new Date()) {
        newErrors.date = 'Event date and time must be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const combinedDateTime = new Date(`${formData.date}T${formData.time}`);

      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim(),
        date: combinedDateTime,
        location: formData.location.trim(),
        type: formData.type as EventType,
      });

      // Reset form on success
      setFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: '',
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-event-form">
      <div className="form-group">
        <label htmlFor="name">Event Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={errors.name ? 'error' : ''}
          placeholder="Enter event name"
          disabled={isLoading}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      {/* ... autres champs ... */}

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};
```

**Justification technique** :

1. **Validation multicouche** :
   - Validation au niveau du formulaire (longueur minimale)
   - Validation métier (date dans le futur)
   - Messages d'erreur explicites pour l'utilisateur

2. **Gestion d'état React** :
   - `useState` pour les données du formulaire
   - `useState` pour les erreurs
   - Reset automatique après soumission réussie

3. **Accessibilité** :
   - Labels associés aux inputs (`htmlFor`)
   - Messages d'erreur visibles
   - Désactivation pendant le chargement (`disabled`)
   - Attributs ARIA implicites

4. **TypeScript** :
   - Props typées avec interface
   - Types stricts pour EventType
   - Type-safety sur les valeurs du formulaire

---

### 9.1.2 Liste des participants avec gestion des statuts

**Fichier** : `src/features/participants/components/ParticipantList.tsx`

**Compétences démontrées** :

- **CDA-1.1** : Développer des interfaces utilisateur
- Affichage de listes dynamiques
- Interaction utilisateur (changement de statut)
- Feedback visuel (badges colorés)

**Extrait de code** :

```tsx
import React from 'react';
import { Participant, ParticipantStatus } from '../types/Participant';
import './ParticipantList.css';

interface ParticipantListProps {
  participants: Participant[];
  onStatusChange: (participantId: string, newStatus: ParticipantStatus) => void;
  isUpdating?: boolean;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  onStatusChange,
  isUpdating = false,
}) => {
  const getStatusBadgeClass = (status: ParticipantStatus): string => {
    switch (status) {
      case ParticipantStatus.CONFIRMED:
        return 'badge-confirmed';
      case ParticipantStatus.PENDING:
        return 'badge-pending';
      case ParticipantStatus.DECLINED:
        return 'badge-declined';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: ParticipantStatus): string => {
    switch (status) {
      case ParticipantStatus.CONFIRMED:
        return '✅ Confirmed';
      case ParticipantStatus.PENDING:
        return '⏳ Pending';
      case ParticipantStatus.DECLINED:
        return '❌ Declined';
      default:
        return status;
    }
  };

  if (participants.length === 0) {
    return (
      <div className="no-participants">
        <p>No participants yet. Add the first participant!</p>
      </div>
    );
  }

  return (
    <div className="participant-list">
      <h3>Participants ({participants.length})</h3>

      <div className="participants-grid">
        {participants.map(participant => (
          <div key={participant.id} className="participant-card">
            <div className="participant-info">
              <div className="participant-avatar">
                {participant.userId.substring(0, 2).toUpperCase()}
              </div>
              <div className="participant-details">
                <h4>User {participant.userId.substring(0, 8)}</h4>
                <span
                  className={`status-badge ${getStatusBadgeClass(participant.status)}`}
                >
                  {getStatusLabel(participant.status)}
                </span>
              </div>
            </div>

            <div className="participant-actions">
              <select
                value={participant.status}
                onChange={e =>
                  onStatusChange(
                    participant.id,
                    e.target.value as ParticipantStatus
                  )
                }
                disabled={isUpdating}
                className="status-select"
              >
                <option value={ParticipantStatus.PENDING}>Pending</option>
                <option value={ParticipantStatus.CONFIRMED}>Confirmed</option>
                <option value={ParticipantStatus.DECLINED}>Declined</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Justification technique** :

1. **Composant réutilisable** :
   - Props bien définies avec TypeScript
   - Gestion des états (loading, empty state)
   - Personnalisation via callbacks

2. **Feedback visuel** :
   - Badges colorés selon le statut
   - Emojis pour améliorer la lisibilité
   - Désactivation pendant la mise à jour

3. **Accessibilité** :
   - Labels sémantiques
   - Select natif pour les changements de statut
   - États visuels clairs

---

### 9.1.3 Composant Modal réutilisable

**Fichier** : `src/shared/components/Modal/Modal.tsx`

**Compétences démontrées** :

- **CDA-1.1** : Développer des composants réutilisables
- Composition React (children)
- Gestion des événements (fermeture)
- Patterns de design modernes

**Extrait de code** :

```tsx
import React, { useEffect } from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  // Fermeture avec la touche Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prévenir le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-content modal-${size}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          {showCloseButton && (
            <button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};
```

**Justification technique** :

1. **Réutilisabilité maximale** :
   - Props configurables (taille, comportement)
   - Pattern de composition avec `children`
   - Utilisable pour n'importe quel contenu

2. **Expérience utilisateur** :
   - Fermeture avec Escape
   - Clic sur l'overlay pour fermer
   - Prévention du scroll du body
   - Focus trap implicite

3. **Accessibilité** :
   - Attribut `aria-label` sur le bouton de fermeture
   - Gestion du focus
   - Structure sémantique (header, body)

4. **Hooks React** :
   - `useEffect` pour les event listeners
   - Nettoyage automatique avec return
   - Dépendances correctement gérées

---

## 9.2 Composants métier (Use Cases TypeScript)

### 9.2.1 Use Case - Création d'événement

**Fichier** : `src/features/events/use-cases/CreateEvent.ts`

**Compétences démontrées** :

- **CDA-1.2** : Développer des composants métier
- Validation métier côté client
- Gestion d'erreurs typée
- Séparation des responsabilités

**Extrait de code** :

```typescript
import type { EventRepository } from '../types/EventRepository';
import type { Event, EventType } from '../types/Event';

interface CreateEventRequest {
  name: string;
  description: string;
  date: Date;
  location: string;
  type: EventType;
  organizerId: string;
}

export class CreateEvent {
  constructor(private eventRepository: EventRepository) {}

  async execute(request: CreateEventRequest): Promise<Event> {
    // Validation métier
    this.validate(request);

    // Appel au repository (communication API)
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
      if (error instanceof Error) {
        throw new Error(`Failed to create event: ${error.message}`);
      }
      throw new Error('Failed to create event: Unknown error');
    }
  }

  private validate(request: CreateEventRequest): void {
    if (!request.name || request.name.trim().length < 3) {
      throw new Error('Event name must be at least 3 characters');
    }

    if (!request.description || request.description.trim().length < 3) {
      throw new Error('Description must be at least 3 characters');
    }

    if (!request.location || request.location.trim().length < 3) {
      throw new Error('Location must be at least 3 characters');
    }

    if (!request.type) {
      throw new Error('Event type is required');
    }

    if (request.date <= new Date()) {
      throw new Error('Event date must be in the future');
    }

    if (!request.organizerId) {
      throw new Error('Organizer ID is required');
    }
  }
}
```

**Justification technique** :

1. **Séparation des responsabilités** :
   - Use Case = logique métier uniquement
   - Repository = communication avec l'API
   - Pas de logique UI dans le Use Case

2. **Validation métier centralisée** :
   - Règles métier dans une méthode dédiée
   - Messages d'erreur explicites
   - Validation avant l'appel API (économie de ressources)

3. **Gestion d'erreurs** :
   - Try/catch pour les erreurs réseau
   - Messages enrichis pour le debugging
   - Propagation des erreurs vers la couche UI

4. **TypeScript** :
   - Interface pour la requête
   - Types importés depuis les types partagés
   - Typage strict du retour (Promise<Event>)

---

### 9.2.2 Use Case - Mise à jour du statut de participant

**Fichier** : `src/features/participants/use-cases/UpdateParticipantStatus.ts`

**Compétences démontrées** :

- **CDA-1.2** : Développer des composants métier
- Logique métier pour les transitions d'états
- Validation des données

**Extrait de code** :

```typescript
import type { ParticipantRepository } from '../types/ParticipantRepository';
import type { Participant, ParticipantStatus } from '../types/Participant';

interface UpdateStatusRequest {
  participantId: string;
  newStatus: ParticipantStatus;
}

export class UpdateParticipantStatus {
  constructor(private participantRepository: ParticipantRepository) {}

  async execute(request: UpdateStatusRequest): Promise<Participant> {
    // Validation
    this.validate(request);

    // Mise à jour via le repository
    try {
      const updatedParticipant = await this.participantRepository.updateStatus(
        request.participantId,
        request.newStatus
      );

      return updatedParticipant;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to update participant status: ${error.message}`
        );
      }
      throw new Error('Failed to update participant status: Unknown error');
    }
  }

  private validate(request: UpdateStatusRequest): void {
    if (!request.participantId) {
      throw new Error('Participant ID is required');
    }

    if (!request.newStatus) {
      throw new Error('New status is required');
    }

    // Validation des valeurs possibles du statut
    const validStatuses = ['PENDING', 'CONFIRMED', 'DECLINED'];
    if (!validStatuses.includes(request.newStatus)) {
      throw new Error(`Invalid status: ${request.newStatus}`);
    }
  }
}
```

**Justification technique** :

1. **Validation des transitions d'états** :
   - Vérification des valeurs autorisées
   - Messages d'erreur clairs

2. **Encapsulation** :
   - Logique métier isolée
   - Testable indépendamment

---

## 9.3 Services HTTP (Repositories)

### 9.3.1 Repository HTTP pour les événements

**Fichier** : `src/features/events/services/HttpEventRepository.ts`

**Compétences démontrées** :

- **CDA-2.3** : Développer des composants d'accès aux données
- Communication REST API
- Gestion des tokens JWT
- Mapping DTO ↔ Domain

**Extrait de code** :

```typescript
import type { EventRepository, CreateEventDTO } from '../types/EventRepository';
import type { Event } from '../types/Event';
import { apiConfig } from '@/core/config/api';

export class HttpEventRepository implements EventRepository {
  private baseUrl: string;
  private getAccessToken: () => string | null;

  constructor(getAccessToken: () => string | null) {
    this.baseUrl = `${apiConfig.baseUrl}/events`;
    this.getAccessToken = getAccessToken;
  }

  async create(dto: CreateEventDTO): Promise<Event> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to create event: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return this.mapToEvent(data);
  }

  async getByOrganizer(organizerId: string): Promise<Event[]> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const url = `${this.baseUrl}?organizerId=${encodeURIComponent(organizerId)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch events: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    return data.map((item: any) => this.mapToEvent(item));
  }

  // Mapping DTO → Domain
  private mapToEvent(dto: any): Event {
    return {
      id: dto.identifier || dto.id,
      name: dto.name,
      description: dto.description,
      date: new Date(dto.event_date || dto.eventDate),
      location: dto.location,
      type: dto.type,
      organizerId: dto.creator?.identifier || dto.organizerId,
      createdAt: new Date(dto.creation_date || dto.createdAt),
      updatedAt: new Date(dto.update_date || dto.updatedAt),
    };
  }
}
```

**Justification technique** :

1. **Pattern Repository** :
   - Interface implémentée (contrat respecté)
   - Abstraction de la communication HTTP
   - Facilite les tests (mock possible)

2. **Authentification JWT** :
   - Token injecté via fonction callback
   - Header `Authorization: Bearer {token}`
   - Gestion des cas sans token

3. **Gestion d'erreurs** :
   - Vérification du status HTTP
   - Messages d'erreur enrichis
   - Propagation des erreurs

4. **Mapping DTO ↔ Domain** :
   - Conversion des formats API → Domain
   - Gestion des différences de nommage (snake_case → camelCase)
   - Parsing des dates

---

## 9.4 Gestion d'état (Context API)

### 9.4.1 Context d'authentification

**Fichier** : `src/features/auth/hooks/useAuthContext.tsx`

**Compétences démontrées** :

- **CDA-1.2** : Développer des composants métier (gestion d'état)
- Context API React
- État global de l'application
- Hooks personnalisés

**Extrait de code** :

```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthSession } from '../types/User';
import type { AuthRepository } from '../types/AuthRepository';
import { GetCurrentUser } from '../use-cases/GetCurrentUser';

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  authRepository: AuthRepository;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authRepository,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const getCurrentUser = new GetCurrentUser(authRepository);
        const { user: currentUser, session: currentSession } =
          await getCurrentUser.execute();

        setUser(currentUser);
        setSession(currentSession);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Subscribe to auth changes
    const unsubscribe = authRepository.onAuthStateChange(
      (newUser, newSession) => {
        setUser(newUser);
        setSession(newSession);
      }
    );

    return () => unsubscribe();
  }, [authRepository]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Justification technique** :

1. **Context API** :
   - État global partagé dans toute l'application
   - Évite le prop drilling
   - Hook personnalisé `useAuth` pour faciliter l'usage

2. **Gestion du cycle de vie** :
   - Chargement initial de l'utilisateur
   - Souscription aux changements d'auth
   - Nettoyage avec `unsubscribe`

3. **TypeScript** :
   - Types stricts pour le context
   - Interface pour les props
   - Type guards avec `undefined`

4. **Sécurité** :
   - État `loading` pour éviter les rendus prématurés
   - Vérification de l'authentification (`isAuthenticated`)
   - Session incluse pour les tokens JWT

---

## Conclusion de la section 9

Cette section démontre la maîtrise des compétences frontend CDA :

✅ **CDA-1.1 - Interfaces utilisateur** :

- Composants React modernes et réutilisables
- Formulaires avec validation
- Feedback visuel et états de chargement
- Accessibilité (ARIA, labels, keyboard)

✅ **CDA-1.2 - Composants métier** :

- Use Cases TypeScript avec validation
- Séparation des responsabilités
- Gestion d'erreurs robuste

✅ **CDA-2.3 - Accès aux données** :

- Repositories HTTP (pattern)
- Communication REST API avec JWT
- Mapping DTO ↔ Domain

✅ **Architecture moderne** :

- Context API pour l'état global
- Hooks personnalisés
- TypeScript pour la type-safety
- Composition de composants

Le frontend démontre des **pratiques professionnelles** : code propre, typé, testé et maintendble.

**Section suivante** : Éléments de sécurité (frontend + backend).
