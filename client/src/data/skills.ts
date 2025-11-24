import { Skill, SkillType, SkillTarget } from '@/types/skill';

export const SKILLS_DATABASE: Record<string, Omit<Skill, 'unlocked'>> = {
  FIREBALL: {
    id: 'FIREBALL',
    name: 'Fireball',
    description: 'Lança uma bola de fogo que causa 20-30 de dano mágico ao alvo.',
    type: SkillType.MAGIC,
    targetType: SkillTarget.SINGLE,
    levelRequired: 5,
    manaCost: 10,
    cooldown: 2000, // 2 segundos
    damageRange: [20, 30],
    range: 5,
    icon: '🔥',
  },
  ICE_BLAST: {
    id: 'ICE_BLAST',
    name: 'Ice Blast',
    description: 'Congela inimigos em uma área, causando 15-25 de dano e reduzindo velocidade.',
    type: SkillType.MAGIC,
    targetType: SkillTarget.AREA,
    levelRequired: 10,
    manaCost: 15,
    cooldown: 3000,
    damageRange: [15, 25],
    range: 4,
    areaRadius: 2,
    icon: '❄️',
  },
  LIGHTNING_STRIKE: {
    id: 'LIGHTNING_STRIKE',
    name: 'Lightning Strike',
    description: 'Invoca um raio que causa 30-45 de dano instantâneo.',
    type: SkillType.MAGIC,
    targetType: SkillTarget.SINGLE,
    levelRequired: 15,
    manaCost: 20,
    cooldown: 4000,
    damageRange: [30, 45],
    range: 6,
    icon: '⚡',
  },
  HEAL: {
    id: 'HEAL',
    name: 'Heal',
    description: 'Restaura 30-40 pontos de vida.',
    type: SkillType.UTILITY,
    targetType: SkillTarget.SELF,
    levelRequired: 3,
    manaCost: 15,
    cooldown: 5000,
    damageRange: [-40, -30], // negativo = cura
    range: 0,
    icon: '💚',
  },
  SHIELD_BASH: {
    id: 'SHIELD_BASH',
    name: 'Shield Bash',
    description: 'Ataque poderoso com escudo causando 15-20 de dano.',
    type: SkillType.ATTACK,
    targetType: SkillTarget.SINGLE,
    levelRequired: 7,
    manaCost: 5,
    cooldown: 1500,
    damageRange: [15, 20],
    range: 1,
    icon: '🛡️',
  },
};

export function createSkill(skillId: keyof typeof SKILLS_DATABASE, unlocked: boolean = false): Skill {
  const skillData = SKILLS_DATABASE[skillId];
  if (!skillData) {
    throw new Error(`Skill ${skillId} not found in database`);
  }
  return {
    ...skillData,
    unlocked,
  };
}

export const INITIAL_SKILLS: Skill[] = [
  createSkill('HEAL', false),
  createSkill('FIREBALL', false),
  createSkill('SHIELD_BASH', false),
  createSkill('ICE_BLAST', false),
  createSkill('LIGHTNING_STRIKE', false),
];
