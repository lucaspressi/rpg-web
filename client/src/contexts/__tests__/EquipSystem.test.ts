import { describe, it, expect } from 'vitest';
import { GameState, Player, Direction, ItemType, Equipment } from '@/types/game';
import { MapSystem } from '@/systems/MapSystem';

// Simular o gameReducer
type GameAction = 
  | { type: 'EQUIP_ITEM'; itemId: string };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'EQUIP_ITEM': {
      const item = state.player.inventory.find((i) => i.id === action.itemId);
      if (!item || !item.type) return state;

      // Determinar o slot baseado no tipo do item
      let slot: keyof Equipment | null = null;
      switch (item.type) {
        case ItemType.WEAPON:
          slot = 'weapon';
          break;
        case ItemType.ARMOR:
          slot = 'armor';
          break;
        case ItemType.SHIELD:
          slot = 'shield';
          break;
        case ItemType.HELMET:
          slot = 'helmet';
          break;
        case ItemType.AMULET:
          slot = 'amulet';
          break;
        case ItemType.RING:
          slot = 'ring';
          break;
        case ItemType.BOOTS:
          slot = 'boots';
          break;
        default:
          return state;
      }

      if (!slot) return state;

      // Remover item do inventário
      const newInventory = state.player.inventory.filter((i) => i.id !== action.itemId);

      // Se já tem item equipado no slot, devolver ao inventário
      const currentEquipped = state.player.equipment[slot];
      if (currentEquipped) {
        newInventory.push(currentEquipped);
      }

      // Equipar novo item
      const newEquipment = {
        ...state.player.equipment,
        [slot]: item,
      };

      return {
        ...state,
        player: {
          ...state.player,
          inventory: newInventory,
          equipment: newEquipment,
        },
      };
    }
    default:
      return state;
  }
}

describe('Equip System', () => {
  const createMockState = (): GameState => ({
    player: {
      id: 'player',
      name: 'Hero',
      position: { x: 10, y: 10 },
      direction: Direction.DOWN,
      sprite: 'player',
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0,
      speed: 3,
      inventory: [
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
          id: 'health_potion',
          name: 'Health Potion',
          description: 'Restores 30 HP',
          sprite: '🧪',
          stackable: true,
          quantity: 3,
          type: ItemType.POTION,
        },
      ],
      equipment: {},
      gold: 100,
    },
    monsters: [],
    npcs: [],
    map: MapSystem.generateMap(20, 20),
    messages: [],
    isPaused: false,
    camera: { x: 10, y: 10 },
    targetId: null,
    destinationPosition: null,
    damageTexts: [],
    respawnQueue: [],
  });

  it('should equip weapon to weapon slot', () => {
    const state = createMockState();
    const newState = gameReducer(state, { type: 'EQUIP_ITEM', itemId: 'iron_sword' });

    expect(newState.player.equipment.weapon).toBeDefined();
    expect(newState.player.equipment.weapon?.id).toBe('iron_sword');
    expect(newState.player.inventory.find(i => i.id === 'iron_sword')).toBeUndefined();
  });

  it('should equip armor to armor slot', () => {
    const state = createMockState();
    const newState = gameReducer(state, { type: 'EQUIP_ITEM', itemId: 'leather_armor' });

    expect(newState.player.equipment.armor).toBeDefined();
    expect(newState.player.equipment.armor?.id).toBe('leather_armor');
    expect(newState.player.inventory.find(i => i.id === 'leather_armor')).toBeUndefined();
  });

  it('should not equip non-equipable items', () => {
    const state = createMockState();
    const newState = gameReducer(state, { type: 'EQUIP_ITEM', itemId: 'health_potion' });

    expect(newState.player.equipment.weapon).toBeUndefined();
    expect(newState.player.inventory.find(i => i.id === 'health_potion')).toBeDefined();
  });

  it('should swap items when slot is already occupied', () => {
    const state = createMockState();
    
    // Equipar primeira espada
    let newState = gameReducer(state, { type: 'EQUIP_ITEM', itemId: 'iron_sword' });
    expect(newState.player.equipment.weapon?.id).toBe('iron_sword');
    expect(newState.player.inventory.length).toBe(2); // 3 - 1 = 2

    // Adicionar segunda espada ao inventário
    newState.player.inventory.push({
      id: 'steel_sword',
      name: 'Steel Sword',
      description: 'A sharp steel sword. Attack +8',
      sprite: '⚔️',
      stackable: false,
      quantity: 1,
      type: ItemType.WEAPON,
      attack: 8,
    });

    // Equipar segunda espada
    newState = gameReducer(newState, { type: 'EQUIP_ITEM', itemId: 'steel_sword' });

    // Deve ter steel_sword equipada
    expect(newState.player.equipment.weapon?.id).toBe('steel_sword');
    
    // iron_sword deve ter voltado ao inventário
    expect(newState.player.inventory.find(i => i.id === 'iron_sword')).toBeDefined();
    
    // steel_sword não deve estar no inventário
    expect(newState.player.inventory.find(i => i.id === 'steel_sword')).toBeUndefined();
  });

  it('should maintain inventory size when swapping equipment', () => {
    const state = createMockState();
    const initialInventorySize = state.player.inventory.length; // 3

    // Equipar espada
    let newState = gameReducer(state, { type: 'EQUIP_ITEM', itemId: 'iron_sword' });
    expect(newState.player.inventory.length).toBe(initialInventorySize - 1); // 2

    // Adicionar segunda espada
    newState = {
      ...newState,
      player: {
        ...newState.player,
        inventory: [
          ...newState.player.inventory,
          {
            id: 'steel_sword',
            name: 'Steel Sword',
            description: 'A sharp steel sword',
            sprite: '⚔️',
            stackable: false,
            quantity: 1,
            type: ItemType.WEAPON,
            attack: 8,
          },
        ],
      },
    };
    expect(newState.player.inventory.length).toBe(3); // 2 + 1

    // Equipar segunda espada (swap)
    newState = gameReducer(newState, { type: 'EQUIP_ITEM', itemId: 'steel_sword' });
    
    // Tamanho do inventário deve ser o mesmo após swap (3 - 1 + 1 = 3)
    expect(newState.player.inventory.length).toBe(3);
    
    // Verificar que iron_sword voltou ao inventário
    expect(newState.player.inventory.find(i => i.id === 'iron_sword')).toBeDefined();
    
    // Verificar que steel_sword está equipada
    expect(newState.player.equipment.weapon?.id).toBe('steel_sword');
  });
});
