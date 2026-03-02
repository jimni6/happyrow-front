import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Participant } from '@/features/participants';
import type { AuthSession } from '@/features/auth';
import {
  HttpParticipantRepository,
  GetParticipants,
} from '@/features/participants';

interface UseParticipantsParams {
  eventId: string;
  session: AuthSession | null;
}

export function useParticipants({ eventId, session }: UseParticipantsParams) {
  const [participants, setParticipants] = useState<Participant[]>([]);

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
    } catch (err) {
      console.error('Failed to load participants:', err);
    }
  }, [eventId, getParticipantsUseCase]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  return { participants, loadParticipants };
}
