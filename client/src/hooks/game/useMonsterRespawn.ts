import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { MovementSystem } from '@/systems/MovementSystem';

export function useMonsterRespawn() {
  const { state, dispatch } = useGame();

  // Processar fila de respawn a cada segundo
  useEffect(() => {
    if (state.isPaused) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const toRespawn = state.respawnQueue.filter((entry) => entry.respawnTime <= now);

      if (toRespawn.length > 0) {
        // Respawnar cada monstro em uma posição aleatória válida
        toRespawn.forEach((entry) => {
          // Encontrar posição válida (walkable e longe do jogador)
          let newPosition = { x: 0, y: 0 };
          let attempts = 0;
          const maxAttempts = 50;

          while (attempts < maxAttempts) {
            const x = Math.floor(Math.random() * state.map[0].length);
            const y = Math.floor(Math.random() * state.map.length);

            // Verificar se o tile é walkable
            if (state.map[y] && state.map[y][x] && state.map[y][x].walkable) {
              // Verificar distância do jogador (pelo menos 10 tiles)
              const distance = MovementSystem.getDistance(
                { x, y },
                state.player.position
              );

              if (distance >= 10) {
                newPosition = { x, y };
                break;
              }
            }

            attempts++;
          }

          // Se não encontrou posição válida, usar uma posição padrão longe
          if (attempts >= maxAttempts) {
            newPosition = {
              x: state.player.position.x + 15,
              y: state.player.position.y + 15,
            };
          }

          // Criar novo monstro na nova posição com ID único
          const respawnedMonster = {
            ...entry.monster,
            id: `${entry.monster.name.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            position: newPosition,
            hp: entry.monster.maxHp, // HP completo
          };

          // Adicionar monstro de volta ao jogo
          dispatch({ type: 'ADD_MONSTER', monster: respawnedMonster });
          
          // Mensagem no log
          dispatch({
            type: 'ADD_MESSAGE',
            message: `A ${entry.monster.name} has respawned!`,
            messageType: 'system',
          });
        });

        // Processar respawns (remover da fila)
        dispatch({ type: 'PROCESS_RESPAWNS' });
      }
    }, 1000); // Verificar a cada segundo

    return () => clearInterval(interval);
  }, [state.respawnQueue, state.isPaused, state.map, state.player.position, dispatch]);
}
