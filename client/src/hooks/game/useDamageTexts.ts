import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export function useDamageTexts() {
  const { dispatch } = useGame();

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch({ type: 'CLEAR_OLD_DAMAGE_TEXTS' });
    }, 100);

    return () => clearInterval(intervalId);
  }, [dispatch]);
}
