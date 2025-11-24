export const GAME_CONFIG = {
  TILE_SIZE: 32,
  VIEWPORT_WIDTH: 15,
  VIEWPORT_HEIGHT: 11,
  FPS: 60,
  PLAYER_SPEED: 4,
  MONSTER_SPEED: 2,
};

export const COLORS = {
  GRASS: '#2d5016',
  STONE: '#5a5a5a',
  WATER: '#1e3a8a',
  WALL: '#3f3f3f',
  DIRT: '#654321',
  PLAYER: '#fbbf24',
  MONSTER: '#dc2626',
  NPC: '#3b82f6',
};

export const INITIAL_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  level: 1,
  experience: 0,
  speed: GAME_CONFIG.PLAYER_SPEED,
  gold: 100,
};
