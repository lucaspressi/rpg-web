import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export function usePlayerDeath() {
  const { state, dispatch } = useGame();

  // Check for player death
  useEffect(() => {
    if (!state.isDead && state.player.hp <= 0) {
      dispatch({ type: 'PLAYER_DEATH' });
    }
  }, [state.player.hp, state.isDead, dispatch]);

  // Update invulnerability status
  useEffect(() => {
    if (state.invulnerable) {
      const interval = setInterval(() => {
        dispatch({ type: 'UPDATE_INVULNERABILITY' });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [state.invulnerable, dispatch]);
}
