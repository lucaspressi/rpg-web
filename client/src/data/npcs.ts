import type { NPC, ShopItem, Direction } from '@/types/game';
import { NPCType, type NPCDialogue } from '@/types/npc';
import { ITEMS } from './items';

// Potion Seller
const potionShop: ShopItem[] = [
  {
    item: ITEMS.HEALTH_POTION,
    buyPrice: 50,
    sellPrice: 25,
  },
  {
    item: ITEMS.MANA_POTION,
    buyPrice: 50,
    sellPrice: 25,
  },
];

const potionSellerDialogue: NPCDialogue = {
  greeting: "Welcome to my potion shop! I have the finest potions in the land.",
  options: [
    { text: "Show me your wares", action: 'shop' },
    { text: "Goodbye", action: 'close' },
  ],
};

export const POTION_SELLER: NPC = {
  id: 'npc_potion_seller',
  name: 'Alchemist Marcus',
  position: { x: 15, y: 10 },
  direction: 'DOWN' as Direction,
  sprite: 'npc',
  type: NPCType.VENDOR,
  dialogue: potionSellerDialogue,
  shop: potionShop,
};

// Weapon Shop
const weaponShop: ShopItem[] = [
  {
    item: ITEMS.SWORD,
    buyPrice: 100,
    sellPrice: 50,
  },
  {
    item: ITEMS.AXE,
    buyPrice: 120,
    sellPrice: 60,
  },
  {
    item: ITEMS.CLUB,
    buyPrice: 80,
    sellPrice: 40,
  },
];

const weaponSellerDialogue: NPCDialogue = {
  greeting: "Looking for a weapon? You've come to the right place!",
  options: [
    { text: "Show me your weapons", action: 'shop' },
    { text: "Goodbye", action: 'close' },
  ],
};

export const WEAPON_SELLER: NPC = {
  id: 'npc_weapon_seller',
  name: 'Blacksmith John',
  position: { x: 20, y: 10 },
  direction: 'DOWN' as Direction,
  sprite: 'npc',
  type: NPCType.VENDOR,
  dialogue: weaponSellerDialogue,
  shop: weaponShop,
};

// Armor Shop
const armorShop: ShopItem[] = [
  {
    item: ITEMS.LEATHER_ARMOR,
    buyPrice: 150,
    sellPrice: 75,
  },
  {
    item: ITEMS.LEATHER_HELMET,
    buyPrice: 80,
    sellPrice: 40,
  },
  {
    item: ITEMS.WOODEN_SHIELD,
    buyPrice: 100,
    sellPrice: 50,
  },
  {
    item: ITEMS.LEATHER_BOOTS,
    buyPrice: 60,
    sellPrice: 30,
  },
];

const armorSellerDialogue: NPCDialogue = {
  greeting: "Need some protection? I've got the best armor around!",
  options: [
    { text: "Show me your armor", action: 'shop' },
    { text: "Goodbye", action: 'close' },
  ],
};

export const ARMOR_SELLER: NPC = {
  id: 'npc_armor_seller',
  name: 'Armorer Sarah',
  position: { x: 25, y: 10 },
  direction: 'DOWN' as Direction,
  sprite: 'npc',
  type: NPCType.VENDOR,
  dialogue: armorSellerDialogue,
  shop: armorShop,
};

// Quest Giver
const questGiverDialogue: NPCDialogue = {
  greeting: "Greetings, adventurer! I have tasks that need doing.",
  options: [
    { text: "What do you need?", action: 'quest', questId: 'rat_problem' },
    { text: "I'm busy right now", action: 'close' },
  ],
};

export const QUEST_GIVER: NPC = {
  id: 'npc_quest_giver',
  name: 'Elder Tom',
  position: { x: 10, y: 15 },
  direction: 'DOWN' as Direction,
  sprite: 'npc',
  type: NPCType.QUEST_GIVER,
  dialogue: questGiverDialogue,
  quests: ['rat_problem'],
};

// All NPCs
export const NPCS: NPC[] = [
  POTION_SELLER,
  WEAPON_SELLER,
  ARMOR_SELLER,
  QUEST_GIVER,
];

/**
 * Get NPC by ID
 */
export function getNPCById(id: string): NPC | undefined {
  return NPCS.find(npc => npc.id === id);
}
