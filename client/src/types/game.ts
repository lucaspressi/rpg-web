export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum TileType {
  GRASS = 'GRASS',
  STONE = 'STONE',
  WATER = 'WATER',
  WALL = 'WALL',
  DIRT = 'DIRT',
}

export interface Tile {
  type: TileType;
  walkable: boolean;
  position: Position;
}

export interface Entity {
  id: string;
  position: Position;
  direction: Direction;
  sprite: string;
}

export interface Character extends Entity {
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  level: number;
  experience: number;
  speed: number;
}

export interface Player extends Character {
  inventory: Item[];
  equipment: Equipment;
  gold: number;
  pvpStatus: PvPStatus;
}

export interface Monster extends Character {
  type: string;
  loot: Item[];
  aggressive: boolean;
  respawnTime: number;
}

export interface NPC extends Entity {
  name: string;
  type: NPCType;
  dialogue: NPCDialogue;
  shop?: ShopItem[];
  quests?: string[]; // IDs das quests que este NPC oferece
}

export interface Item {
  id: string;
  name: string;
  description: string;
  sprite: string;
  stackable: boolean;
  quantity: number;
  type: ItemType;
  attack?: number; // Bonus de ataque
  defense?: number; // Bonus de defesa
  speed?: number; // Bonus de velocidade
}

export enum ItemType {
  WEAPON = 'WEAPON',
  ARMOR = 'ARMOR',
  HELMET = 'HELMET',
  SHIELD = 'SHIELD',
  BOOTS = 'BOOTS',
  AMULET = 'AMULET',
  RING = 'RING',
  POTION = 'POTION',
  FOOD = 'FOOD',
  MISC = 'MISC',
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  helmet?: Item;
  shield?: Item;
  boots?: Item;
  legs?: Item;
  amulet?: Item;
  ring?: Item;
  arrows?: Item;
  backpack?: Item;
}

export interface ShopItem {
  item: Item;
  buyPrice: number;
  sellPrice: number;
  stock?: number; // undefined = estoque infinito
}

export interface Camera {
  x: number;
  y: number;
}

export interface DamageText {
  id: string;
  damage: number;
  position: Position;
  timestamp: number;
  type: 'player' | 'monster';
}

import { Skill, SkillProjectile } from './skill';
import type { MultiplayerState } from './multiplayer';
import type { PvPStatus } from './pvp';
import type { NPCType, NPCDialogue, Quest } from './npc';

export interface RespawnEntry {
  monster: Monster;
  respawnTime: number; // timestamp quando deve respawnar
}

export interface GameState {
  player: Player;
  monsters: Monster[];
  npcs: NPC[];
  map: Tile[][];
  isPaused: boolean;
  messages: GameMessage[];
  targetId: string | null;
  destination: { x: number; y: number } | null;
  destinationPosition: { x: number; y: number } | null; // Alias para destination
  camera: { x: number; y: number };
  damageTexts: DamageText[];
  respawnQueue: RespawnEntry[];
  skills: Skill[]; // Lista de todas as skills
  unlockedSkills: string[];
  skillPoints: number;
  projectiles: SkillProjectile[];
  multiplayer: MultiplayerState;
  activeQuests: Quest[];
  completedQuests: string[]; // IDs das quests finalizadas
  activeNPC: string | null; // ID do NPC com quem está interagindo
  isDead: boolean;
  deathTimestamp: number | null;
  invulnerable: boolean;
  invulnerableUntil: number | null;
}

export interface GameMessage {
  id: string;
  text: string;
  timestamp: number;
  type: 'info' | 'combat' | 'loot' | 'system';
}
