import { Item, ItemType } from '@/types/game';

export const STARTER_ITEMS: Item[] = [
  {
    id: 'health-potion-starter',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    sprite: 'health-potion',
    stackable: true,
    quantity: 2,
    type: ItemType.POTION,
  },
  {
    id: 'mana-potion-starter',
    name: 'Mana Potion',
    description: 'Restores 30 Mana',
    sprite: 'mana-potion',
    stackable: true,
    quantity: 1,
    type: ItemType.POTION,
  },
  {
    id: 'bread-starter',
    name: 'Bread',
    description: 'Restores 20 HP',
    sprite: 'bread',
    stackable: true,
    quantity: 1,
    type: ItemType.FOOD,
  },
];

// Armas (Weapons)
export const WEAPON_ITEMS: Item[] = [
  {
    id: 'wooden_sword',
    name: 'Wooden Sword',
    description: 'A simple wooden sword. Attack +2',
    sprite: '⚔️',
    stackable: false,
    quantity: 1,
    type: ItemType.WEAPON,
    attack: 2,
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A sturdy iron sword. Attack +5',
    sprite: '⚔️',
    stackable: false,
    quantity: 1,
    type: ItemType.WEAPON,
    attack: 5,
  },
  {
    id: 'steel_sword',
    name: 'Steel Sword',
    description: 'A sharp steel sword. Attack +8',
    sprite: '⚔️',
    stackable: false,
    quantity: 1,
    type: ItemType.WEAPON,
    attack: 8,
  },
  {
    id: 'club',
    name: 'Club',
    description: 'A heavy wooden club. Attack +3',
    sprite: '🏏',
    stackable: false,
    quantity: 1,
    type: ItemType.WEAPON,
    attack: 3,
  },
  {
    id: 'axe',
    name: 'Battle Axe',
    description: 'A powerful battle axe. Attack +6',
    sprite: '🪓',
    stackable: false,
    quantity: 1,
    type: ItemType.WEAPON,
    attack: 6,
  },
];

// Armaduras (Armor)
export const ARMOR_ITEMS: Item[] = [
  {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Light leather armor. Defense +3',
    sprite: '🛡️',
    stackable: false,
    quantity: 1,
    type: ItemType.ARMOR,
    defense: 3,
  },
  {
    id: 'chain_armor',
    name: 'Chain Armor',
    description: 'Chainmail armor. Defense +6',
    sprite: '🛡️',
    stackable: false,
    quantity: 1,
    type: ItemType.ARMOR,
    defense: 6,
  },
  {
    id: 'plate_armor',
    name: 'Plate Armor',
    description: 'Heavy plate armor. Defense +10',
    sprite: '🛡️',
    stackable: false,
    quantity: 1,
    type: ItemType.ARMOR,
    defense: 10,
  },
];

// Escudos (Shields)
export const SHIELD_ITEMS: Item[] = [
  {
    id: 'wooden_shield',
    name: 'Wooden Shield',
    description: 'A basic wooden shield. Defense +2',
    sprite: '🛡️',
    stackable: false,
    quantity: 1,
    type: ItemType.SHIELD,
    defense: 2,
  },
  {
    id: 'iron_shield',
    name: 'Iron Shield',
    description: 'A solid iron shield. Defense +4',
    sprite: '🛡️',
    stackable: false,
    quantity: 1,
    type: ItemType.SHIELD,
    defense: 4,
  },
  {
    id: 'steel_shield',
    name: 'Steel Shield',
    description: 'A reinforced steel shield. Defense +7',
    sprite: '🛡️',
    stackable: false,
    quantity: 1,
    type: ItemType.SHIELD,
    defense: 7,
  },
];

// Capacetes (Helmets)
export const HELMET_ITEMS: Item[] = [
  {
    id: 'leather_helmet',
    name: 'Leather Helmet',
    description: 'Basic head protection. Defense +1',
    sprite: '⛑️',
    stackable: false,
    quantity: 1,
    type: ItemType.HELMET,
    defense: 1,
  },
  {
    id: 'iron_helmet',
    name: 'Iron Helmet',
    description: 'Solid iron helmet. Defense +3',
    sprite: '⛑️',
    stackable: false,
    quantity: 1,
    type: ItemType.HELMET,
    defense: 3,
  },
];

// Botas (Boots)
export const BOOTS_ITEMS: Item[] = [
  {
    id: 'leather_boots',
    name: 'Leather Boots',
    description: 'Comfortable leather boots. Speed +1',
    sprite: '👢',
    stackable: false,
    quantity: 1,
    type: ItemType.BOOTS,
    speed: 1,
  },
];

// Todos os equipamentos drop\u00e1veis
export const ALL_EQUIPMENT = [
  ...WEAPON_ITEMS,
  ...ARMOR_ITEMS,
  ...SHIELD_ITEMS,
  ...HELMET_ITEMS,
  ...BOOTS_ITEMS,
];

// Itens base (sem ID único) para usar em shops
export const ITEMS = {
  HEALTH_POTION: {
    id: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 50 HP',
    sprite: 'health-potion',
    stackable: true,
    quantity: 1,
    type: ItemType.POTION,
  } as Item,
  MANA_POTION: {
    id: 'mana_potion',
    name: 'Mana Potion',
    description: 'Restores 30 Mana',
    sprite: 'mana-potion',
    stackable: true,
    quantity: 1,
    type: ItemType.POTION,
  } as Item,
  SWORD: WEAPON_ITEMS[0],
  AXE: WEAPON_ITEMS[1],
  CLUB: WEAPON_ITEMS[2],
  LEATHER_ARMOR: ARMOR_ITEMS[0],
  LEATHER_HELMET: HELMET_ITEMS[0],
  WOODEN_SHIELD: SHIELD_ITEMS[0],
  LEATHER_BOOTS: BOOTS_ITEMS[0],
};

// Função para buscar item por ID
export function getItemById(itemId: string): Item | undefined {
  const allItems = [...STARTER_ITEMS, ...ALL_EQUIPMENT];
  return allItems.find(item => item.id === itemId);
}
