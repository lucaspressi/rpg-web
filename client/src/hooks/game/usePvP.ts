import { useEffect, useCallback, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { PvPSystem } from '@/systems/PvPSystem';
import { toast } from 'sonner';
import { io, Socket } from 'socket.io-client';

export function usePvP(socket: Socket | null) {
  const { state, dispatch } = useGame();

  // Atualizar PvP status periodicamente (flags, cooldowns)
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'UPDATE_PVP_STATUS' });
    }, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [dispatch]);

  // Função para atacar outro jogador
  const attackPlayer = useCallback((targetPlayerId: number) => {
    const target = state.multiplayer.onlinePlayers.get(targetPlayerId);
    
    if (!target) {
      toast.error('Target player not found');
      return false;
    }

    // Verificar se pode atacar
    const { canAttack, reason } = PvPSystem.canAttackPlayer(
      state.player,
      target.position
    );

    if (!canAttack) {
      toast.error(reason || 'Cannot attack this player');
      return false;
    }

    // Calcular dano (simplificado - em produção seria no servidor)
    const damage = PvPSystem.calculatePvPDamage(state.player, {
      ...state.player, // Usar stats do player local como base
      level: target.level,
      hp: target.hp,
      maxHp: target.maxHp,
    });

    // Aplicar flag de atacante
    const newPvpStatus = PvPSystem.applyAttackerFlag(state.player);
    
    dispatch({
      type: 'UPDATE_PLAYER',
      player: {
        ...state.player,
        pvpStatus: newPvpStatus,
      },
    });

    // Emitir evento PvP para o servidor
    if (socket && socket.connected) {
      socket.emit('pvp:attack', {
        targetPlayerId,
        damage,
      });
      
      console.log(`[PvP] Emitted attack to player ${targetPlayerId} for ${damage} damage`);
    }

    dispatch({
      type: 'ADD_MESSAGE',
      message: `You attacked ${target.name} for ${damage} damage!`,
      messageType: 'combat',
    });

    toast.success(`Attacked ${target.name} for ${damage} damage!`);
    
    return true;
  }, [state.player, state.multiplayer.onlinePlayers, dispatch, socket]);

  return {
    attackPlayer,
    pvpStatus: state.player.pvpStatus,
    canAttack: state.player.pvpStatus.canAttack,
  };
}
