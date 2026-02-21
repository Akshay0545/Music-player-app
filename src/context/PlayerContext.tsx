import React, { createContext, useContext } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

type PlayerActions = ReturnType<typeof useAudioPlayer>;

const PlayerContext = createContext<PlayerActions | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer();
  return <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>;
}

export function usePlayerActions(): PlayerActions {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayerActions must be used within PlayerProvider');
  return ctx;
}
