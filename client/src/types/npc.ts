import type { Item } from './game';

export enum NPCType {
  VENDOR = 'VENDOR',
  QUEST_GIVER = 'QUEST_GIVER',
  GENERIC = 'GENERIC',
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  objectives: QuestObjective[];
  rewards: QuestReward;
  status: QuestStatus;
  npcId: string;       // ID do NPC que dá a quest
}

export interface QuestObjective {
  type: 'kill' | 'collect' | 'talk';
  target: string;      // ID do monstro, item ou NPC
  current: number;
  required: number;
  description: string;
}

export interface QuestReward {
  xp: number;
  gold: number;
  items: Item[];
}

export enum QuestStatus {
  AVAILABLE = 'AVAILABLE',     // Disponível para aceitar
  ACTIVE = 'ACTIVE',           // Em progresso
  COMPLETED = 'COMPLETED',     // Completada mas não entregue
  FINISHED = 'FINISHED',       // Entregue e recompensa recebida
}

export interface DialogueOption {
  text: string;
  action: 'shop' | 'quest' | 'close' | 'accept_quest' | 'complete_quest';
  questId?: string;
}

export interface NPCDialogue {
  greeting: string;
  options: DialogueOption[];
}
