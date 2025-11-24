import { Position } from './game';

export enum SkillType {
  ATTACK = 'attack',
  DEFENSE = 'defense',
  MAGIC = 'magic',
  UTILITY = 'utility',
}

export enum SkillTarget {
  SINGLE = 'single',
  AREA = 'area',
  SELF = 'self',
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  targetType: SkillTarget;
  levelRequired: number;
  manaCost: number;
  cooldown: number; // em milissegundos
  damage?: number;
  damageRange?: [number, number]; // [min, max]
  range: number; // em tiles
  areaRadius?: number; // para skills de área
  icon: string; // emoji ou ícone
  unlocked: boolean;
}

export interface ActiveSkill extends Skill {
  lastUsed: number; // timestamp
  hotkey?: number; // 1-9
}

export interface SkillProjectile {
  id: string;
  skillId: string;
  position: Position;
  targetPosition: Position;
  speed: number;
  damage: number;
  sprite: string;
  createdAt: number;
}
