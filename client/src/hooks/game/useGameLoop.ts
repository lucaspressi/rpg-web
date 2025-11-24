import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { AISystem } from '@/systems/AISystem';

export function useGameLoop() {
  const { state, dispatch } = useGame();
  const lastUpdateRef = useRef<number>(Date.now());
  const monsterUpdateIntervalRef = useRef<number>(0);

  useEffect(() => {
    if (state.isPaused) return;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = now - lastUpdateRef.current;

      // Atualizar monstros a cada 500ms
      monsterUpdateIntervalRef.current += deltaTime;
      if (monsterUpdateIntervalRef.current >= 500) {
        monsterUpdateIntervalRef.current = 0;

        const updatedMonsters = AISystem.updateAllMonsters(
          state.monsters,
          state.player,
          state.map
        );

        dispatch({ type: 'UPDATE_MONSTERS', monsters: updatedMonsters });
      }

      lastUpdateRef.current = now;
    };

    const intervalId = setInterval(gameLoop, 500);

    return () => clearInterval(intervalId);
  }, [state.monsters, state.player, state.map, state.isPaused, dispatch]);
}
