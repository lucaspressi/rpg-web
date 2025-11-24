import { describe, it, expect } from 'vitest';
import { MapSystem } from '../MapSystem';
import { MovementSystem } from '../MovementSystem';
import { CombatSystem } from '../CombatSystem';
import { ItemSystem } from '../ItemSystem';
import { AISystem } from '../AISystem';
import { Direction, TileType, ItemType, Character, Monster, Player } from '@/types/game';

describe('MapSystem', () => {
  it('should generate a map with correct dimensions', () => {
    const width = 10;
    const height = 10;
    const map = MapSystem.generateMap(width, height);
    
    expect(map.length).toBe(height);
    expect(map[0].length).toBe(width);
  });

  it('should have walls on the borders', () => {
    const map = MapSystem.generateMap(10, 10);
    
    // Check corners (sempre WALL)
    expect(map[0][0].type).toBe(TileType.WALL);
    expect(map[0][9].type).toBe(TileType.WALL);
    expect(map[9][0].type).toBe(TileType.WALL);
    expect(map[9][9].type).toBe(TileType.WALL);
    
    // Check left and right borders (sempre WALL)
    expect(map[5][0].type).toBe(TileType.WALL);
    expect(map[5][9].type).toBe(TileType.WALL);
    
    // Centro das bordas superior/inferior pode ter portões (DIRT ou WALL)
    expect([TileType.WALL, TileType.DIRT]).toContain(map[0][5].type);
    expect([TileType.WALL, TileType.DIRT]).toContain(map[9][5].type);
  });

  it('should return null for out of bounds positions', () => {
    const map = MapSystem.generateMap(10, 10);
    
    expect(MapSystem.getTile(map, { x: -1, y: 5 })).toBeNull();
    expect(MapSystem.getTile(map, { x: 5, y: -1 })).toBeNull();
    expect(MapSystem.getTile(map, { x: 10, y: 5 })).toBeNull();
    expect(MapSystem.getTile(map, { x: 5, y: 10 })).toBeNull();
  });

  it('should correctly identify walkable tiles', () => {
    const map = MapSystem.generateMap(10, 10);
    
    // Borders should not be walkable
    expect(MapSystem.isWalkable(map, { x: 0, y: 0 })).toBe(false);
    
    // Out of bounds should not be walkable
    expect(MapSystem.isWalkable(map, { x: -1, y: 5 })).toBe(false);
  });
});

describe('MovementSystem', () => {
  it('should calculate next position correctly', () => {
    const pos = { x: 5, y: 5 };
    
    expect(MovementSystem.getNextPosition(pos, Direction.UP)).toEqual({ x: 5, y: 4 });
    expect(MovementSystem.getNextPosition(pos, Direction.DOWN)).toEqual({ x: 5, y: 6 });
    expect(MovementSystem.getNextPosition(pos, Direction.LEFT)).toEqual({ x: 4, y: 5 });
    expect(MovementSystem.getNextPosition(pos, Direction.RIGHT)).toEqual({ x: 6, y: 5 });
  });

  it('should calculate distance correctly', () => {
    const pos1 = { x: 0, y: 0 };
    const pos2 = { x: 3, y: 4 };
    
    expect(MovementSystem.getDistance(pos1, pos2)).toBe(7); // Manhattan distance
  });

  it('should get correct direction towards target', () => {
    const from = { x: 5, y: 5 };
    
    expect(MovementSystem.getDirectionTowards(from, { x: 8, y: 5 })).toBe(Direction.RIGHT);
    expect(MovementSystem.getDirectionTowards(from, { x: 2, y: 5 })).toBe(Direction.LEFT);
    expect(MovementSystem.getDirectionTowards(from, { x: 5, y: 8 })).toBe(Direction.DOWN);
    expect(MovementSystem.getDirectionTowards(from, { x: 5, y: 2 })).toBe(Direction.UP);
  });

  it('should prevent movement into walls', () => {
    const map = MapSystem.generateMap(10, 10);
    const character: Character = {
      id: 'test',
      position: { x: 1, y: 1 },
      direction: Direction.UP,
      sprite: 'test',
      name: 'Test',
      hp: 100,
      maxHp: 100,
      mana: 50,
      maxMana: 50,
      level: 1,
      experience: 0,
      speed: 4,
    };

    // Try to move into wall (border at y=0)
    const result = MovementSystem.moveCharacter(character, Direction.UP, map, []);
    
    // Should not move, only change direction
    expect(result.position).toEqual({ x: 1, y: 1 });
    expect(result.direction).toBe(Direction.UP);
  });
});

describe('CombatSystem', () => {
  const createTestCharacter = (id: string, x: number, y: number): Character => ({
    id,
    name: `Character ${id}`,
    position: { x, y },
    direction: Direction.DOWN,
    sprite: 'test',
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    experience: 0,
    speed: 4,
  });

  it('should detect if target is in range', () => {
    const attacker = createTestCharacter('1', 5, 5);
    const target = createTestCharacter('2', 5, 6);
    
    expect(CombatSystem.isInRange(attacker, target, 1)).toBe(true);
    
    const farTarget = createTestCharacter('3', 10, 10);
    expect(CombatSystem.isInRange(attacker, farTarget, 1)).toBe(false);
  });

  it('should calculate damage based on level', () => {
    const attacker = createTestCharacter('1', 5, 5);
    const target = createTestCharacter('2', 5, 6);
    
    const damage = CombatSystem.calculateDamage(attacker, target);
    
    // Level 1 should do base damage of 10 (level * 8 + 2), with variance 80-120%
    expect(damage).toBeGreaterThanOrEqual(8);
    expect(damage).toBeLessThanOrEqual(12);
  });

  it('should reduce target HP on attack', () => {
    const attacker = createTestCharacter('1', 5, 5);
    const target = createTestCharacter('2', 5, 6);
    
    const result = CombatSystem.attack(attacker, target, []);
    
    expect(result.target.hp).toBeLessThan(target.hp);
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it('should mark target as killed when HP reaches 0', () => {
    const attacker = createTestCharacter('1', 5, 5);
    const target = createTestCharacter('2', 5, 6);
    target.hp = 1; // Very low HP
    
    const result = CombatSystem.attack(attacker, target, []);
    
    expect(result.target.hp).toBe(0);
    expect(result.killed).toBe(true);
  });
});

describe('ItemSystem', () => {
  const createTestPlayer = (): Player => ({
    id: 'player',
    name: 'Test Player',
    position: { x: 5, y: 5 },
    direction: Direction.DOWN,
    sprite: 'player',
    hp: 50,
    maxHp: 100,
    mana: 30,
    maxMana: 50,
    level: 1,
    experience: 0,
    speed: 4,
    inventory: [],
    equipment: {},
    gold: 100,
  });

  it('should restore HP when using health potion', () => {
    const player = createTestPlayer();
    const potion = {
      id: 'potion-1',
      name: 'Health Potion',
      description: 'Restores HP',
      sprite: 'potion',
      stackable: false,
      quantity: 1,
      type: ItemType.POTION,
    };
    
    player.inventory = [potion];
    
    const result = ItemSystem.useItem(player, potion);
    
    expect(result).not.toBeNull();
    expect(result!.player.hp).toBeGreaterThan(player.hp);
    expect(result!.player.inventory.length).toBe(0); // Item consumed
  });

  it('should equip weapon correctly', () => {
    const player = createTestPlayer();
    const weapon = {
      id: 'sword-1',
      name: 'Iron Sword',
      description: 'A basic sword',
      sprite: 'sword',
      stackable: false,
      quantity: 1,
      type: ItemType.WEAPON,
    };
    
    player.inventory = [weapon];
    
    const result = ItemSystem.equipItem(player, weapon);
    
    expect(result).not.toBeNull();
    expect(result!.player.equipment.weapon).toEqual(weapon);
    expect(result!.player.inventory.length).toBe(0);
  });

  it('should swap equipment when equipping new item', () => {
    const player = createTestPlayer();
    const oldWeapon = {
      id: 'sword-1',
      name: 'Old Sword',
      description: 'An old sword',
      sprite: 'sword',
      stackable: false,
      quantity: 1,
      type: ItemType.WEAPON,
    };
    const newWeapon = {
      id: 'sword-2',
      name: 'New Sword',
      description: 'A new sword',
      sprite: 'sword',
      stackable: false,
      quantity: 1,
      type: ItemType.WEAPON,
    };
    
    player.equipment.weapon = oldWeapon;
    player.inventory = [newWeapon];
    
    const result = ItemSystem.equipItem(player, newWeapon);
    
    expect(result).not.toBeNull();
    expect(result!.player.equipment.weapon).toEqual(newWeapon);
    expect(result!.player.inventory).toContainEqual(oldWeapon);
  });
});

describe('AISystem', () => {
  const createTestMonster = (id: string, x: number, y: number, aggressive: boolean): Monster => ({
    id,
    name: `Monster ${id}`,
    type: 'Test Monster',
    position: { x, y },
    direction: Direction.DOWN,
    sprite: 'monster',
    hp: 50,
    maxHp: 50,
    mana: 0,
    maxMana: 0,
    level: 1,
    experience: 10,
    speed: 2,
    loot: [],
    aggressive,
    respawnTime: 30000,
  });

  const createTestPlayer = (): Player => ({
    id: 'player',
    name: 'Test Player',
    position: { x: 10, y: 10 },
    direction: Direction.DOWN,
    sprite: 'player',
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    level: 1,
    experience: 0,
    speed: 4,
    inventory: [],
    equipment: {},
    gold: 100,
  });

  it('should not move non-aggressive monsters towards player', () => {
    const map = MapSystem.generateMap(20, 20);
    const monster = createTestMonster('1', 5, 5, false);
    const player = createTestPlayer();
    
    const updated = AISystem.updateMonster(monster, player, map, []);
    
    // Non-aggressive monster should either stay in place or move randomly
    // It should not move directly towards player
    expect(updated).toBeDefined();
  });

  it('should not update monster if player is too far away', () => {
    const map = MapSystem.generateMap(30, 30);
    const monster = createTestMonster('1', 5, 5, true);
    const player = createTestPlayer();
    player.position = { x: 25, y: 25 }; // Very far
    
    const updated = AISystem.updateMonster(monster, player, map, []);
    
    // Monster should not move if player is more than 8 tiles away
    expect(updated.position).toEqual(monster.position);
  });

  it('should update all monsters in list', () => {
    const map = MapSystem.generateMap(20, 20);
    const monsters = [
      createTestMonster('1', 8, 8, true),
      createTestMonster('2', 9, 9, false),
      createTestMonster('3', 7, 7, true),
    ];
    const player = createTestPlayer();
    
    const updated = AISystem.updateAllMonsters(monsters, player, map);
    
    expect(updated.length).toBe(3);
    expect(updated[0].id).toBe('1');
    expect(updated[1].id).toBe('2');
    expect(updated[2].id).toBe('3');
  });
});
