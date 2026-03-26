import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Participant } from '@/features/participants';
import type { AuthSession } from '@/features/auth';
import {
  HttpParticipantRepository,
  GetParticipants,
} from '@/features/participants';
import { ApiError } from '@/core/errors/ApiError';

interface UseParticipantsParams {
  eventId: string;
  session: AuthSession | null;
}

export function useParticipants({ eventId, session }: UseParticipantsParams) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [forbidden, setForbidden] = useState(false);

  const participantRepository = useMemo(
    () => new HttpParticipantRepository(() => session?.accessToken || null),
    [session]
  );

  const getParticipantsUseCase = useMemo(
    () => new GetParticipants(participantRepository),
    [participantRepository]
  );

  const loadParticipants = useCallback(async () => {
    try {
      const loadedParticipants = await getParticipantsUseCase.execute({
        eventId,
      });
      setParticipants(loadedParticipants);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.isForbidden) {
        setForbidden(true);
      }
    }
  }, [eventId, getParticipantsUseCase]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  return { participants, loadParticipants, forbidden };
}
