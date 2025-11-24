import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Direction } from '@/types/game';
import { MovementSystem } from '@/systems/MovementSystem';
import { CombatSystem } from '@/systems/CombatSystem';

export function useAutoAttack() {
  const { state, dispatch } = useGame();
  const stateRef = useRef(state);
  
  // Sempre manter a referência atualizada
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!state.targetId || state.isPaused) return;

    const intervalId = setInterval(() => {
      const currentState = stateRef.current;
      console.log('[AutoAttack] Interval tick', { isPaused: currentState.isPaused, targetId: currentState.targetId });
      
      if (currentState.isPaused || !currentState.targetId) return;
      
      const target = currentState.monsters.find((m) => m.id === currentState.targetId);
      console.log('[AutoAttack] Target found:', target);
      
      // Se o alvo não existe mais, limpar target
      if (!target) {
        dispatch({ type: 'SET_TARGET', targetId: null });
        return;
      }

      const distance = MovementSystem.getDistance(currentState.player.position, target.position);
      console.log('[AutoAttack] Distance to target:', distance, 'Player:', currentState.player.position, 'Target:', target.position);

      // Se estiver no alcance, atacar
      if (distance <= 1) {
        const { target: damagedMonster, messages, killed } = CombatSystem.attack(
          currentState.player,
          target,
          currentState.messages,
          false // Player is never invulnerable when attacking
        );

        // Calcular dano causado
        const damageDealt = target.hp - damagedMonster.hp;
        
        // Adicionar texto de dano
        dispatch({
          type: 'ADD_DAMAGE_TEXT',
          damage: damageDealt,
          position: target.position,
          damageType: 'player',
        });

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
            CombatSystem.collectLoot(currentState.player, target, []);

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
            target.experience
          );

          if (playerWithExp.level > updatedPlayer.level) {
      dispatch({
        type: 'ADD_MESSAGE',
        message: `Level Up! You are now level ${playerWithExp.level}!`,
        messageType: 'system',
      });
      dispatch({ type: 'ADD_SKILL_POINT' });
          }

          dispatch({ type: 'UPDATE_PLAYER', player: playerWithExp });
          if (currentState.targetId) {
            // Adicionar à fila de respawn (30-60 segundos)
            const respawnDelay = 30000 + Math.random() * 30000; // 30-60s
            dispatch({
              type: 'QUEUE_RESPAWN',
              monster: target,
              respawnTime: Date.now() + respawnDelay,
            });
            
            dispatch({ type: 'REMOVE_MONSTER', monsterId: currentState.targetId });
          }
          dispatch({ type: 'SET_TARGET', targetId: null });
        } else {
          // Atualizar HP do monstro
          const updatedMonsters = currentState.monsters.map((m) =>
            m.id === currentState.targetId ? { ...m, hp: damagedMonster.hp } : m
          );
          dispatch({ type: 'UPDATE_MONSTERS', monsters: updatedMonsters });

          // Monstro contra-ataca
          setTimeout(() => {
            const latestState = stateRef.current;
            const currentPlayer = latestState.player;
            const { target: attackedPlayer, messages: counterMessages } =
              CombatSystem.attack(damagedMonster, currentPlayer, []);

            // Calcular dano recebido
            const damageReceived = currentPlayer.hp - attackedPlayer.hp;
            
            // Adicionar texto de dano
            dispatch({
              type: 'ADD_DAMAGE_TEXT',
              damage: damageReceived,
              position: currentPlayer.position,
              damageType: 'monster',
            });

            counterMessages.forEach((msg) => {
              dispatch({
                type: 'ADD_MESSAGE',
                message: msg.text,
                messageType: msg.type,
              });
            });

            const damagedPlayer: typeof currentPlayer = {
              ...currentPlayer,
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
              dispatch({ type: 'SET_TARGET', targetId: null });
            }
          }, 500);
        }
      } else {
        // Se não estiver no alcance, mover em direção ao alvo
        console.log('[AutoAttack] Not in range, moving towards target');
        const direction = MovementSystem.getDirectionTowards(
          currentState.player.position,
          target.position
        );
        console.log('[AutoAttack] Direction:', direction);

        if (direction) {
          const allCharacters = [currentState.player, ...currentState.monsters];
          const movedPlayer = MovementSystem.moveCharacter(
            currentState.player,
            direction,
            currentState.map,
            allCharacters.filter((c) => c.id !== currentState.player.id)
          );

          console.log('[AutoAttack] Moving player from', currentState.player.position, 'to', movedPlayer.position);

          const newPlayer: typeof currentState.player = {
            ...currentState.player,
            position: movedPlayer.position,
            direction: movedPlayer.direction,
          };

          dispatch({ type: 'UPDATE_PLAYER', player: newPlayer });
        }
      }
    }, 400);

    return () => clearInterval(intervalId);
  }, [state.targetId, state.isPaused, dispatch]);

  // Cancelar auto-ataque com ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.targetId) {
        dispatch({ type: 'SET_TARGET', targetId: null });
        dispatch({
          type: 'ADD_MESSAGE',
          message: 'Auto-attack cancelled.',
          messageType: 'info',
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.targetId, dispatch]);

  return {
    setTarget: (targetId: string | null) => {
      dispatch({ type: 'SET_TARGET', targetId });
      if (targetId) {
        const target = state.monsters.find((m) => m.id === targetId);
        if (target) {
          dispatch({
            type: 'ADD_MESSAGE',
            message: `Auto-attacking ${target.name}! Press ESC to cancel.`,
            messageType: 'info',
          });
        }
      }
    },
  };
}
