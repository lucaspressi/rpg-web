import { Monster, Direction, ItemType, Item } from '@/types/game';
import { WEAPON_ITEMS, ARMOR_ITEMS, SHIELD_ITEMS, HELMET_ITEMS, BOOTS_ITEMS } from './items';

// Função auxiliar para criar loot com chance
function createLootTable(guaranteedLoot: Item[], possibleLoot: { item: Item; chance: number }[]): Item[] {
  const loot = [...guaranteedLoot];
  
  // Adicionar itens com chance
  possibleLoot.forEach(({ item, chance }) => {
    if (Math.random() < chance) {
      loot.push({ ...item, id: `${item.id}-${Date.now()}-${Math.random()}` });
    }
  });
  
  return loot;
}

export const MONSTER_TEMPLATES = {
  RAT: {
    type: 'Rat',
    maxHp: 10,
    level: 1,
    experience: 15,
    speed: 2,
    aggressive: false,
    getLoot: () => createLootTable(
      [
        {
          id: `gold-${Date.now()}`,
          name: 'Gold Coins',
          description: 'Shiny gold coins',
          sprite: 'gold',
          stackable: true,
          quantity: 5,
          type: ItemType.MISC,
        },
      ],
      [
        { item: WEAPON_ITEMS[0], chance: 0.05 }, // 5% Wooden Sword
        { item: ARMOR_ITEMS[0], chance: 0.03 }, // 3% Leather Armor
      ]
    ),
    respawnTime: 30000,
  },
  TROLL: {
    type: 'Troll',
    maxHp: 35,
    level: 3,
    experience: 40,
    speed: 1,
    aggressive: true,
    getLoot: () => createLootTable(
      [
        {
          id: `gold-${Date.now()}`,
          name: 'Gold Coins',
          description: 'Shiny gold coins',
          sprite: 'gold',
          stackable: true,
          quantity: 15,
          type: ItemType.MISC,
        },
      ],
      [
        { item: WEAPON_ITEMS[1], chance: 0.10 }, // 10% Iron Sword
        { item: WEAPON_ITEMS[3], chance: 0.08 }, // 8% Club
        { item: ARMOR_ITEMS[0], chance: 0.10 }, // 10% Leather Armor
        { item: ARMOR_ITEMS[1], chance: 0.07 }, // 7% Chain Armor
        { item: SHIELD_ITEMS[0], chance: 0.10 }, // 10% Wooden Shield
        { item: HELMET_ITEMS[0], chance: 0.05 }, // 5% Leather Helmet
      ]
    ),
    respawnTime: 60000,
  },
  SKELETON: {
    type: 'Skeleton',
    maxHp: 60,
    level: 5,
    experience: 75,
    speed: 2,
    aggressive: true,
    getLoot: () => createLootTable(
      [
        {
          id: `gold-${Date.now()}`,
          name: 'Gold Coins',
          description: 'Shiny gold coins',
          sprite: 'gold',
          stackable: true,
          quantity: 25,
          type: ItemType.MISC,
        },
      ],
      [
        { item: WEAPON_ITEMS[2], chance: 0.15 }, // 15% Steel Sword
        { item: WEAPON_ITEMS[4], chance: 0.10 }, // 10% Battle Axe
        { item: ARMOR_ITEMS[2], chance: 0.15 }, // 15% Plate Armor
        { item: SHIELD_ITEMS[1], chance: 0.12 }, // 12% Iron Shield
        { item: SHIELD_ITEMS[2], chance: 0.08 }, // 8% Steel Shield
        { item: HELMET_ITEMS[1], chance: 0.10 }, // 10% Iron Helmet
        { item: BOOTS_ITEMS[0], chance: 0.12 }, // 12% Leather Boots
      ]
    ),
    respawnTime: 90000,
  },
};

export function createMonster(
  type: keyof typeof MONSTER_TEMPLATES,
  id: string,
  x: number,
  y: number
): Monster {
  const template = MONSTER_TEMPLATES[type];
  // Gerar ID único usando crypto.randomUUID() para garantir unicidade absoluta
  const uniqueId = `${type.toLowerCase()}-${crypto.randomUUID()}`;
  return {
    id: uniqueId,
    name: template.type,
    type: template.type,
    position: { x, y },
    direction: Direction.DOWN,
    sprite: type.toLowerCase(),
    hp: template.maxHp,
    maxHp: template.maxHp,
    mana: 0,
    maxMana: 0,
    level: template.level,
    experience: template.experience,
    speed: template.speed,
    loot: template.getLoot(),
    aggressive: template.aggressive,
    respawnTime: template.respawnTime,
  };
}
