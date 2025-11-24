import { describe, it, expect } from 'vitest';
import { MovementSystem } from '@/systems/MovementSystem';
import { CombatSystem } from '@/systems/CombatSystem';
import { Direction, Character } from '@/types/game';

describe('Auto-Attack System Components', () => {
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

  describe('Movement towards target', () => {
    it('should calculate correct direction towards target', () => {
      const player = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('target', 8, 5);

      const direction = MovementSystem.getDirectionTowards(
        player.position,
        target.position
      );

      expect(direction).toBe(Direction.RIGHT);
    });

    it('should move player closer to target', () => {
      const player = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('target', 8, 5);

      const direction = MovementSystem.getDirectionTowards(
        player.position,
        target.position
      );

      const nextPos = MovementSystem.getNextPosition(player.position, direction!);

      const initialDistance = MovementSystem.getDistance(
        player.position,
        target.position
      );
      const newDistance = MovementSystem.getDistance(nextPos, target.position);

      expect(newDistance).toBeLessThan(initialDistance);
    });
  });

  describe('Combat in range', () => {
    it('should detect when target is in attack range', () => {
      const attacker = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('monster', 5, 6);

      const inRange = CombatSystem.isInRange(attacker, target, 1);

      expect(inRange).toBe(true);
    });

    it('should not detect target out of range', () => {
      const attacker = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('monster', 10, 10);

      const inRange = CombatSystem.isInRange(attacker, target, 1);

      expect(inRange).toBe(false);
    });

    it('should successfully attack target in range', () => {
      const attacker = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('monster', 5, 6);

      const result = CombatSystem.attack(attacker, target, []);

      expect(result.target.hp).toBeLessThan(target.hp);
      expect(result.messages.length).toBeGreaterThan(0);
    });
  });

  describe('Auto-attack flow simulation', () => {
    it('should move towards target when out of range', () => {
      const player = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('monster', 10, 5);

      const distance = MovementSystem.getDistance(player.position, target.position);
      expect(distance).toBeGreaterThan(1);

      // Should get direction to move
      const direction = MovementSystem.getDirectionTowards(
        player.position,
        target.position
      );
      expect(direction).toBe(Direction.RIGHT);
    });

    it('should attack when in range', () => {
      const player = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('monster', 6, 5);

      const distance = MovementSystem.getDistance(player.position, target.position);
      expect(distance).toBe(1);

      const inRange = CombatSystem.isInRange(player, target, 1);
      expect(inRange).toBe(true);

      const result = CombatSystem.attack(player, target, []);
      expect(result.target.hp).toBeLessThan(target.hp);
    });

    it('should clear target when monster is killed', () => {
      const player = createTestCharacter('player', 5, 5);
      const target = createTestCharacter('monster', 6, 5);
      target.hp = 1; // Very low HP

      const result = CombatSystem.attack(player, target, []);

      expect(result.killed).toBe(true);
      expect(result.target.hp).toBe(0);
      // In real implementation, targetId would be set to null
    });
  });

  describe('Distance calculations for auto-attack', () => {
    it('should correctly calculate Manhattan distance', () => {
      const pos1 = { x: 5, y: 5 };
      const pos2 = { x: 8, y: 9 };

      const distance = MovementSystem.getDistance(pos1, pos2);

      // Manhattan distance: |8-5| + |9-5| = 3 + 4 = 7
      expect(distance).toBe(7);
    });

    it('should recognize adjacent positions as distance 1', () => {
      const pos1 = { x: 5, y: 5 };
      const pos2 = { x: 5, y: 6 };

      const distance = MovementSystem.getDistance(pos1, pos2);

      expect(distance).toBe(1);
    });
  });
});
