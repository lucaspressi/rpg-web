import type { Position } from './game';

export interface OnlinePlayer {
  userId: number;
  playerId: number;
  name: string;
  level: number;
  position: Position;
  hp: number;
  maxHp: number;
  socketId: string;
}

export interface MultiplayerState {
  connected: boolean;
  onlinePlayers: Map<number, OnlinePlayer>;
}
