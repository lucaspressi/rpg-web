import type { Quest, QuestStatus } from '@/types/npc';
import { ITEMS } from './items';

export const QUESTS: Record<string, Omit<Quest, 'status'>> = {
  rat_problem: {
    id: 'rat_problem',
    name: 'Rat Problem',
    description: 'Elder Tom needs help dealing with the rat infestation. Kill 5 rats to help the village.',
    npcId: 'npc_quest_giver',
    objectives: [
      {
        type: 'kill',
        target: 'rat',
        current: 0,
        required: 5,
        description: 'Kill 5 rats',
      },
    ],
    rewards: {
      xp: 100,
      gold: 50,
      items: [ITEMS.HEALTH_POTION],
    },
  },
  troll_hunter: {
    id: 'troll_hunter',
    name: 'Troll Hunter',
    description: 'The trolls have been terrorizing travelers. Defeat 3 trolls to make the roads safe again.',
    npcId: 'npc_quest_giver',
    objectives: [
      {
        type: 'kill',
        target: 'troll',
        current: 0,
        required: 3,
        description: 'Kill 3 trolls',
      },
    ],
    rewards: {
      xp: 250,
      gold: 150,
      items: [ITEMS.LEATHER_ARMOR],
    },
  },
};

/**
 * Get quest by ID
 */
export function getQuestById(questId: string): Omit<Quest, 'status'> | undefined {
  return QUESTS[questId];
}

/**
 * Create a new quest instance with AVAILABLE status
 */
export function createQuestInstance(questId: string): Quest | undefined {
  const questTemplate = getQuestById(questId);
  if (!questTemplate) return undefined;

  return {
    ...questTemplate,
    status: 'AVAILABLE' as QuestStatus,
    objectives: questTemplate.objectives.map(obj => ({ ...obj })),
  };
}
