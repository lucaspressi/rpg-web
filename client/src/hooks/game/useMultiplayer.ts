import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGame } from '@/contexts/GameContext';
import { parseCookies } from '@/lib/cookies';
import { COOKIE_NAME } from '@shared/const';
import type { OnlinePlayer } from '@/types/multiplayer';

export function useMultiplayer() {
  const { state, dispatch } = useGame();
  const socketRef = useRef<Socket | null>(null);
  const lastPositionRef = useRef({ x: state.player.position.x, y: state.player.position.y });
  const lastStatsRef = useRef({
    hp: state.player.hp,
    maxHp: state.player.maxHp,
    level: state.player.level,
  });

  useEffect(() => {
    // Get session token from cookies
    const cookies = parseCookies(document.cookie);
    const token = cookies[COOKIE_NAME];

    if (!token) {
      console.warn('[Multiplayer] No session token found');
      return;
    }

    // Connect to Socket.io server
    const socket = io({
      path: '/api/socket.io',
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[Multiplayer] Connected to server');
      dispatch({ type: 'SET_MULTIPLAYER_CONNECTED', connected: true });

      // Join the game with current player state
      socket.emit('player:join', {
        position: state.player.position,
        level: state.player.level,
        hp: state.player.hp,
        maxHp: state.player.maxHp,
      });

      dispatch({
        type: 'ADD_MESSAGE',
        message: 'Connected to multiplayer server',
        messageType: 'system',
      });
    });

    socket.on('disconnect', () => {
      console.log('[Multiplayer] Disconnected from server');
      dispatch({ type: 'SET_MULTIPLAYER_CONNECTED', connected: false });
      dispatch({
        type: 'ADD_MESSAGE',
        message: 'Disconnected from multiplayer server',
        messageType: 'system',
      });
    });

    socket.on('connect_error', (error) => {
      console.error('[Multiplayer] Connection error:', error);
      dispatch({
        type: 'ADD_MESSAGE',
        message: 'Failed to connect to multiplayer server',
        messageType: 'system',
      });
    });

    // Player events
    socket.on('players:list', (players: OnlinePlayer[]) => {
      console.log('[Multiplayer] Received players list:', players);
      dispatch({ type: 'SET_ONLINE_PLAYERS', players });
    });

    socket.on('player:joined', (player: OnlinePlayer) => {
      console.log('[Multiplayer] Player joined:', player.name);
      dispatch({ type: 'ADD_ONLINE_PLAYER', player });
      dispatch({
        type: 'ADD_MESSAGE',
        message: `${player.name} (Level ${player.level}) joined the game`,
        messageType: 'system',
      });
    });

    socket.on('player:moved', (data: { playerId: number; position: { x: number; y: number } }) => {
      dispatch({
        type: 'UPDATE_ONLINE_PLAYER',
        playerId: data.playerId,
        position: data.position,
      });
    });

    socket.on('player:updated', (data: { playerId: number; hp: number; maxHp: number; level: number }) => {
      dispatch({
        type: 'UPDATE_ONLINE_PLAYER_STATS',
        playerId: data.playerId,
        hp: data.hp,
        maxHp: data.maxHp,
        level: data.level,
      });
    });

    socket.on('player:left', (playerId: number) => {
      const player = state.multiplayer.onlinePlayers.get(playerId);
      if (player) {
        console.log('[Multiplayer] Player left:', player.name);
        dispatch({
          type: 'ADD_MESSAGE',
          message: `${player.name} left the game`,
          messageType: 'system',
        });
      }
      dispatch({ type: 'REMOVE_ONLINE_PLAYER', playerId });
    });

    // PvP events
    socket.on('pvp:damage', (data: { attackerId: number; attackerName: string; targetPlayerId: number; damage: number }) => {
      console.log('[PvP] Damage event:', data);
      
      // Se eu sou o alvo, receber dano
      // Note: targetPlayerId é o ID do banco de dados do jogador
      // Precisamos verificar se somos o alvo comparando com nosso user ID
      dispatch({
        type: 'RECEIVE_PVP_DAMAGE',
        damage: data.damage,
        attackerId: data.attackerId,
      });
    });

    socket.on('pvp:death', (data: { victimId: number; victimName: string; killerId: number; killerName: string }) => {
      console.log('[PvP] Death event:', data);
      
      // Se eu sou a vítima, processar morte
      dispatch({
        type: 'PVP_DEATH',
        killerId: data.killerId,
      });
      
      // Mensagem para todos
      dispatch({
        type: 'ADD_MESSAGE',
        message: `${data.victimName} was killed by ${data.killerName}!`,
        messageType: 'system',
      });
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array - only connect once

  // Sync player position changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    const currentPos = state.player.position;
    const lastPos = lastPositionRef.current;

    // Only emit if position actually changed
    if (currentPos.x !== lastPos.x || currentPos.y !== lastPos.y) {
      socket.emit('player:move', currentPos);
      lastPositionRef.current = { x: currentPos.x, y: currentPos.y };
    }
  }, [state.player.position]);

  // Sync player stats changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !socket.connected) return;

    const currentStats = {
      hp: state.player.hp,
      maxHp: state.player.maxHp,
      level: state.player.level,
    };
    const lastStats = lastStatsRef.current;

    // Only emit if stats actually changed
    if (
      currentStats.hp !== lastStats.hp ||
      currentStats.maxHp !== lastStats.maxHp ||
      currentStats.level !== lastStats.level
    ) {
      socket.emit('player:update', currentStats);
      lastStatsRef.current = currentStats;
    }
  }, [state.player.hp, state.player.maxHp, state.player.level]);

  return {
    connected: state.multiplayer.connected,
    onlinePlayers: Array.from(state.multiplayer.onlinePlayers.values()),
    socket: socketRef.current,
  };
}
