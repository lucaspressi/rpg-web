/**
 * Shared types for game state synchronization between client and server
 */

export interface GameProgress {
  level: number;
  experience: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  gold: number;
  positionX: number;
  positionY: number;
  skillPoints: number;
}

export interface InventoryItemData {
  itemId: string;
  quantity: number;
}

export interface EquipmentData {
  helmet?: string | null;
  amulet?: string | null;
  backpack?: string | null;
  weapon?: string | null;
  armor?: string | null;
  shield?: string | null;
  ring?: string | null;
  legs?: string | null;
  arrows?: string | null;
  boots?: string | null;
}

export interface PlayerSkillData {
  skillId: string;
  unlocked: boolean;
}

export interface FullGameState {
  progress: GameProgress;
  inventory: InventoryItemData[];
  equipment: EquipmentData;
  skills: PlayerSkillData[];
}

export interface LeaderboardEntry {
  playerName: string | null;
  level: number;
  experience: number;
  gold: number;
}
