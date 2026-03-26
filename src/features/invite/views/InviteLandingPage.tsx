import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import {
  HttpInviteRepository,
  AlreadyParticipantError,
} from '../services/HttpInviteRepository';
import { ValidateInvite } from '../use-cases/ValidateInvite';
import { AcceptInvite } from '../use-cases/AcceptInvite';
import type { InviteValidation } from '../types/Invite';
import './InviteLandingPage.css';

const PENDING_INVITE_KEY = 'pending_invite_token';

const STATUS_MESSAGES: Record<string, { title: string; message: string }> = {
  EXPIRED: {
    title: 'Invitation expirée',
    message:
      "Ce lien d'invitation a expiré. Demandez un nouveau lien à l'organisateur.",
  },
  REVOKED: {
    title: 'Invitation révoquée',
    message: "Ce lien d'invitation a été désactivé par l'organisateur.",
  },
  EXHAUSTED: {
    title: 'Invitation épuisée',
    message: "Ce lien d'invitation a atteint le nombre maximum d'utilisations.",
  },
};

export const InviteLandingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuth();

  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  const repository = useMemo(
    () => new HttpInviteRepository(() => session?.accessToken || null),
    [session]
  );

  const loadInvite = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const validate = new ValidateInvite(repository);
      const result = await validate.execute(token);
      if (!result) {
        setError('NOT_FOUND');
      } else {
        setInvite(result);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load invitation'
      );
    } finally {
      setLoading(false);
    }
  }, [token, repository]);

  useEffect(() => {
    loadInvite();
  }, [loadInvite]);

  const handleJoin = async () => {
    if (!token) return;

    if (!isAuthenticated) {
      localStorage.setItem(PENDING_INVITE_KEY, token);
      navigate('/');
      return;
    }

    setJoining(true);
    setError(null);
    try {
      const accept = new AcceptInvite(repository);
      const result = await accept.execute(token);
      setJoined(true);
      setTimeout(() => navigate(`/events/${result.eventId}`), 1500);
    } catch (err) {
      if (err instanceof AlreadyParticipantError) {
        navigate(`/events/${err.eventId}`);
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to join event');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="invite-landing">
        <div className="invite-landing-card">
          <div className="invite-loading-spinner" />
          <p className="invite-loading-text">Chargement de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (error === 'NOT_FOUND') {
    return (
      <div className="invite-landing">
        <div className="invite-landing-card invite-landing-card--error">
          <div className="invite-error-icon">🔗</div>
          <h1 className="invite-error-title">Lien invalide</h1>
          <p className="invite-error-message">
            Ce lien d'invitation n'existe pas ou a été supprimé.
          </p>
          <button
            type="button"
            className="invite-home-btn"
            onClick={() => navigate('/')}
          >
            Accueil
          </button>
        </div>
      </div>
    );
  }

  if (invite && invite.status !== 'VALID') {
    const statusInfo = STATUS_MESSAGES[invite.status];
    return (
      <div className="invite-landing">
        <div className="invite-landing-card invite-landing-card--error">
          <div className="invite-error-icon">⏳</div>
          <h1 className="invite-error-title">
            {statusInfo?.title ?? 'Invitation invalide'}
          </h1>
          <p className="invite-error-message">
            {statusInfo?.message ?? "Ce lien n'est plus valide."}
          </p>
          <button
            type="button"
            className="invite-home-btn"
            onClick={() => navigate('/')}
          >
            Accueil
          </button>
        </div>
      </div>
    );
  }

  if (invite && invite.event) {
    const event = invite.event;
    return (
      <div className="invite-landing">
        <div className="invite-landing-card">
          <div className="invite-card-gradient-border">
            <div className="invite-card-inner">
              <div className="invite-event-type-badge">{event.type}</div>
              <h1 className="invite-event-name">{event.name}</h1>
              <div className="invite-event-details">
                <div className="invite-event-detail-row">
                  <span className="invite-detail-icon" aria-hidden="true">
                    📅
                  </span>
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="invite-event-detail-row">
                  <span className="invite-detail-icon" aria-hidden="true">
                    🕐
                  </span>
                  <span>{formatTime(event.eventDate)}</span>
                </div>
                <div className="invite-event-detail-row">
                  <span className="invite-detail-icon" aria-hidden="true">
                    📍
                  </span>
                  <span>{event.location}</span>
                </div>
                <div className="invite-event-detail-row">
                  <span className="invite-detail-icon" aria-hidden="true">
                    👤
                  </span>
                  <span>Organisé par {event.organizerName}</span>
                </div>
                <div className="invite-event-detail-row">
                  <span className="invite-detail-icon" aria-hidden="true">
                    👥
                  </span>
                  <span>
                    {event.participantCount} participant
                    {event.participantCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {joined ? (
            <div className="invite-success-message">
              <span aria-hidden="true">🎉</span> Vous avez rejoint l'événement !
            </div>
          ) : error ? (
            <div className="invite-join-error">{error}</div>
          ) : null}

          {!joined && (
            <button
              type="button"
              className="invite-join-btn"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining
                ? 'Connexion...'
                : isAuthenticated
                  ? 'Rejoindre'
                  : 'Se connecter pour rejoindre'}
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
};
