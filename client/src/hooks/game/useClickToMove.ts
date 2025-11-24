import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { MovementSystem } from '@/systems/MovementSystem';

export function useClickToMove() {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (!state.destinationPosition || state.isPaused) return;

    const intervalId = setInterval(() => {
      const destination = state.destinationPosition;
      if (!destination) return;

      const distance = MovementSystem.getDistance(state.player.position, destination);

      // Se chegou no destino, parar
      if (distance === 0) {
        dispatch({ type: 'SET_DESTINATION', destination: null });
        return;
      }

      // Mover em direção ao destino
      const direction = MovementSystem.getDirectionTowards(
        state.player.position,
        destination
      );

      if (direction) {
        const allCharacters = [state.player, ...state.monsters];
        const movedPlayer = MovementSystem.moveCharacter(
          state.player,
          direction,
          state.map,
          allCharacters.filter((c) => c.id !== state.player.id)
        );

        const newPlayer: typeof state.player = {
          ...state.player,
          position: movedPlayer.position,
          direction: movedPlayer.direction,
        };

        dispatch({ type: 'UPDATE_PLAYER', player: newPlayer });
      }
    }, 150); // Movimento a cada 150ms

    return () => clearInterval(intervalId);
  }, [state.destinationPosition, state.isPaused, state.player, state.monsters, state.map, dispatch]);

  return {
    setDestination: (destination: { x: number; y: number } | null) => {
      dispatch({ type: 'SET_DESTINATION', destination });
    },
  };
}
