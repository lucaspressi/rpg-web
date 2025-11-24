import { describe, it, expect } from 'vitest';
import { StatsSystem } from '../StatsSystem';
import { Player, Equipment, Direction, ItemType } from '@/types/game';

describe('StatsSystem', () => {
  const createMockPlayer = (equipment: Partial<Equipment> = {}): Player => ({
    id: 'player1',
    name: 'Hero',
    position: { x: 10, y: 10 },
    direction: Direction.DOWN,
    sprite: 'hero',
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    experience: 0,
    speed: 3,
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      shield: null,
      helmet: null,
      amulet: null,
      backpack: null,
      ring: null,
      legs: null,
      arrows: null,
      boots: null,
      ...equipment,
    },
    gold: 100,
  });

  describe('calculateAttackBonus', () => {
    it('should return 0 when no weapon equipped', () => {
      const player = createMockPlayer();
      const attackBonus = StatsSystem.calculateAttackBonus(player.equipment);
      expect(attackBonus).toBe(0);
    });

    it('should return weapon attack bonus', () => {
      const player = createMockPlayer({
        weapon: {
          id: 'iron_sword',
          name: 'Iron Sword',
          description: 'A sturdy iron sword',
          sprite: '⚔️',
          stackable: false,
          quantity: 1,
          type: ItemType.WEAPON,
          attack: 5,
        },
      });
      const attackBonus = StatsSystem.calculateAttackBonus(player.equipment);
      expect(attackBonus).toBe(5);
    });
  });

  describe('calculateDefenseBonus', () => {
    it('should return 0 when no defensive equipment', () => {
      const player = createMockPlayer();
      const defenseBonus = StatsSystem.calculateDefenseBonus(player.equipment);
      expect(defenseBonus).toBe(0);
    });

    it('should sum defense from armor', () => {
      const player = createMockPlayer({
        armor: {
          id: 'leather_armor',
          name: 'Leather Armor',
          description: 'Light leather armor',
          sprite: '🛡️',
          stackable: false,
          quantity: 1,
          type: ItemType.ARMOR,
          defense: 3,
        },
      });
      const defenseBonus = StatsSystem.calculateDefenseBonus(player.equipment);
      expect(defenseBonus).toBe(3);
    });

    it('should sum defense from multiple items', () => {
      const player = createMockPlayer({
        armor: {
          id: 'leather_armor',
          name: 'Leather Armor',
          description: 'Light leather armor',
          sprite: '🛡️',
          stackable: false,
          quantity: 1,
          type: ItemType.ARMOR,
          defense: 3,
        },
        shield: {
          id: 'wooden_shield',
          name: 'Wooden Shield',
          description: 'A basic wooden shield',
          sprite: '🛡️',
          stackable: false,
          quantity: 1,
          type: ItemType.SHIELD,
          defense: 2,
        },
        helmet: {
          id: 'leather_helmet',
          name: 'Leather Helmet',
          description: 'Basic head protection',
          sprite: '⛑️',
          stackable: false,
          quantity: 1,
          type: ItemType.HELMET,
          defense: 1,
        },
      });
      const defenseBonus = StatsSystem.calculateDefenseBonus(player.equipment);
      expect(defenseBonus).toBe(6); // 3 + 2 + 1
    });
  });

  describe('calculateTotalDamage', () => {
    it('should calculate base damage for level 1 player without weapon', () => {
      const player = createMockPlayer();
      const damage = StatsSystem.calculateTotalDamage(player);
      
      // Level 1 * 8 = 8 base damage, with ±20% variation (6-10)
      expect(damage).toBeGreaterThanOrEqual(6);
      expect(damage).toBeLessThanOrEqual(10);
    });

    it('should add weapon bonus to damage', () => {
      const player = createMockPlayer({
        weapon: {
          id: 'steel_sword',
          name: 'Steel Sword',
          description: 'A sharp steel sword',
          sprite: '⚔️',
          stackable: false,
          quantity: 1,
          type: ItemType.WEAPON,
          attack: 8,
        },
      });
      
      const damage = StatsSystem.calculateTotalDamage(player);
      
      // Level 1 * 8 + 8 weapon = 16 base, with ±20% variation (12-20)
      expect(damage).toBeGreaterThanOrEqual(12);
      expect(damage).toBeLessThanOrEqual(20);
    });

    it('should scale with player level', () => {
      const player = createMockPlayer();
      player.level = 5;
      
      const damage = StatsSystem.calculateTotalDamage(player);
      
      // Level 5 * 8 = 40 base damage, with ±20% variation (32-48)
      expect(damage).toBeGreaterThanOrEqual(32);
      expect(damage).toBeLessThanOrEqual(48);
    });
  });

  describe('calculateDamageReceived', () => {
    it('should return full damage with 0 defense', () => {
      const damageReceived = StatsSystem.calculateDamageReceived(100, 0);
      expect(damageReceived).toBe(100);
    });

    it('should reduce damage by 5% per defense point', () => {
      const damageReceived = StatsSystem.calculateDamageReceived(100, 10);
      // 10 defense = 50% reduction, so 50 damage
      expect(damageReceived).toBe(50);
    });

    it('should cap damage reduction at 80%', () => {
      const damageReceived = StatsSystem.calculateDamageReceived(100, 20);
      // 20 defense would be 100% reduction, but capped at 80%, so 20 damage (rounded down to 19)
      expect(damageReceived).toBeGreaterThanOrEqual(19);
      expect(damageReceived).toBeLessThanOrEqual(20);
    });

    it('should always deal at least 1 damage', () => {
      const damageReceived = StatsSystem.calculateDamageReceived(1, 100);
      expect(damageReceived).toBe(1);
    });
  });

  describe('calculateSpeedBonus', () => {
    it('should return 0 when no boots equipped', () => {
      const player = createMockPlayer();
      const speedBonus = StatsSystem.calculateSpeedBonus(player.equipment);
      expect(speedBonus).toBe(0);
    });

    it('should return boots speed bonus', () => {
      const player = createMockPlayer({
        boots: {
          id: 'leather_boots',
          name: 'Leather Boots',
          description: 'Comfortable leather boots',
          sprite: '👢',
          stackable: false,
          quantity: 1,
          type: ItemType.BOOTS,
          speed: 1,
        },
      });
      const speedBonus = StatsSystem.calculateSpeedBonus(player.equipment);
      expect(speedBonus).toBe(1);
    });
  });
});
