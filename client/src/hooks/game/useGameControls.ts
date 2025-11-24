import { useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Direction } from '@/types/game';
import { MovementSystem } from '@/systems/MovementSystem';
import { CombatSystem } from '@/systems/CombatSystem';

export function useGameControls() {
  const { state, dispatch } = useGame();

  const movePlayer = useCallback(
    (direction: Direction) => {
      if (state.isPaused) return;

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
    },
    [state.player, state.monsters, state.map, state.isPaused, dispatch]
  );

  const attackMonster = useCallback(
    (monsterId: string) => {
      if (state.isPaused) return;

      const monster = state.monsters.find((m) => m.id === monsterId);
      if (!monster) return;

      if (!CombatSystem.isInRange(state.player, monster)) {
        dispatch({
          type: 'ADD_MESSAGE',
          message: 'Target is too far away!',
          messageType: 'info',
        });
        return;
      }

      // Player ataca monstro
      const { target: damagedMonster, messages, killed } = CombatSystem.attack(
        state.player,
        monster,
        state.messages
      );

      // Atualizar mensagens
      messages.forEach((msg) => {
        dispatch({
          type: 'ADD_MESSAGE',
          message: msg.text,
          messageType: msg.type,
        });
      });

      if (killed) {
        // Coletar loot
        const { player: updatedPlayer, messages: lootMessages } =
          CombatSystem.collectLoot(state.player, monster, []);

        lootMessages.forEach((msg) => {
          dispatch({
            type: 'ADD_MESSAGE',
            message: msg.text,
            messageType: msg.type,
          });
        });

        // Ganhar experiência
        const playerWithExp = CombatSystem.gainExperience(
          updatedPlayer,
          monster.experience
        );

        if (playerWithExp.level > updatedPlayer.level) {
          dispatch({
            type: 'ADD_MESSAGE',
            message: `Level Up! You are now level ${playerWithExp.level}!`,
            messageType: 'system',
          });
        }

        dispatch({ type: 'UPDATE_PLAYER', player: playerWithExp });
        dispatch({ type: 'REMOVE_MONSTER', monsterId });
      } else {
        // Atualizar HP do monstro
        const updatedMonsters = state.monsters.map((m) =>
          m.id === monsterId ? { ...m, hp: damagedMonster.hp } : m
        );
        dispatch({ type: 'UPDATE_MONSTERS', monsters: updatedMonsters });

        // Monstro contra-ataca
        setTimeout(() => {
          const { target: attackedPlayer, messages: counterMessages } =
            CombatSystem.attack(damagedMonster, state.player, [], state.invulnerable);

          counterMessages.forEach((msg) => {
            dispatch({
              type: 'ADD_MESSAGE',
              message: msg.text,
              messageType: msg.type,
            });
          });

          const damagedPlayer: typeof state.player = {
            ...state.player,
            hp: attackedPlayer.hp,
          };

          dispatch({ type: 'UPDATE_PLAYER', player: damagedPlayer });

          if (damagedPlayer.hp <= 0) {
            dispatch({
              type: 'ADD_MESSAGE',
              message: 'You have been defeated! Game Over.',
              messageType: 'system',
            });
            dispatch({ type: 'TOGGLE_PAUSE' });
          }
        }, 500);
      }
    },
    [state, dispatch]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.isPaused) return;

      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          e.preventDefault();
          movePlayer(Direction.UP);
          break;
        case 's':
        case 'arrowdown':
          e.preventDefault();
          movePlayer(Direction.DOWN);
          break;
        case 'a':
        case 'arrowleft':
          e.preventDefault();
          movePlayer(Direction.LEFT);
          break;
        case 'd':
        case 'arrowright':
          e.preventDefault();
          movePlayer(Direction.RIGHT);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer, state.isPaused]);

  return {
    movePlayer,
    attackMonster,
  };
}
