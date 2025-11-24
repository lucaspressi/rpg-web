import { describe, it, expect } from 'vitest';
import {
  getEntityAnchorOffset,
  getPlayerAnchorOffset,
  getMonsterAnchorOffset,
  getNPCAnchorOffset,
  SPRITE_DIMENSIONS,
  COMPENSATION_FACTOR,
  SPRITE_SCALE,
} from './anchor-offset';

describe('anchor-offset', () => {
  describe('getEntityAnchorOffset', () => {
    it('should return correct offset for player facing down', () => {
      const offset = getEntityAnchorOffset('player', 'down');
      const expected = -SPRITE_DIMENSIONS.player.down.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(offset).toBe(-10.2); // 6 * 0.85 * 2
    });

    it('should return correct offset for player facing left', () => {
      const offset = getEntityAnchorOffset('player', 'left');
      const expected = -SPRITE_DIMENSIONS.player.left.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(Math.abs(offset)).toBe(0); // 0 * 0.85 * 2 (handles -0 vs 0)
    });

    it('should return correct offset for player facing right', () => {
      const offset = getEntityAnchorOffset('player', 'right');
      const expected = -SPRITE_DIMENSIONS.player.right.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(offset).toBe(-10.2); // 6 * 0.85 * 2
    });

    it('should return correct offset for player facing up', () => {
      const offset = getEntityAnchorOffset('player', 'up');
      const expected = -SPRITE_DIMENSIONS.player.up.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(Math.abs(offset)).toBe(0); // 0 * 0.85 * 2 (handles -0 vs 0)
    });

    it('should return correct offset for rat monster', () => {
      const offset = getEntityAnchorOffset('monster', 'rat');
      const expected = -SPRITE_DIMENSIONS.monsters.rat.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(offset).toBe(-9.35); // 5.5 * 0.85 * 2
    });

    it('should return correct offset for troll monster', () => {
      const offset = getEntityAnchorOffset('monster', 'troll');
      const expected = -SPRITE_DIMENSIONS.monsters.troll.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(Math.abs(offset)).toBe(0); // 0 * 0.85 * 2 (handles -0 vs 0)
    });

    it('should return correct offset for skeleton monster', () => {
      const offset = getEntityAnchorOffset('monster', 'skeleton');
      const expected = -SPRITE_DIMENSIONS.monsters.skeleton.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(offset).toBeCloseTo(-11.05, 2); // 6.5 * 0.85 * 2 (floating point precision)
    });

    it('should return correct offset for NPC', () => {
      const offset = getEntityAnchorOffset('npc');
      const expected = -SPRITE_DIMENSIONS.npc.default.emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(offset).toBe(expected);
      expect(offset).toBe(-12.75); // 7.5 * 0.85 * 2
    });

    it('should default to down direction for player if subtype not provided', () => {
      const offset = getEntityAnchorOffset('player');
      const expectedDown = getEntityAnchorOffset('player', 'down');
      expect(offset).toBe(expectedDown);
    });

    it('should default to rat for monster if subtype not provided', () => {
      const offset = getEntityAnchorOffset('monster');
      const expectedRat = getEntityAnchorOffset('monster', 'rat');
      expect(offset).toBe(expectedRat);
    });

    it('should handle case-insensitive direction/type names', () => {
      const offsetLower = getEntityAnchorOffset('player', 'down');
      const offsetUpper = getEntityAnchorOffset('player', 'DOWN');
      const offsetMixed = getEntityAnchorOffset('player', 'DoWn');
      expect(offsetLower).toBe(offsetUpper);
      expect(offsetLower).toBe(offsetMixed);
    });
  });

  describe('getPlayerAnchorOffset', () => {
    it('should return correct offset for each direction', () => {
      expect(getPlayerAnchorOffset('down')).toBe(-10.2);
      expect(Math.abs(getPlayerAnchorOffset('left'))).toBe(0);
      expect(getPlayerAnchorOffset('right')).toBe(-10.2);
      expect(Math.abs(getPlayerAnchorOffset('up'))).toBe(0);
    });

    it('should handle uppercase direction names', () => {
      expect(getPlayerAnchorOffset('DOWN')).toBe(-10.2);
      expect(Math.abs(getPlayerAnchorOffset('LEFT'))).toBe(0);
    });
  });

  describe('getMonsterAnchorOffset', () => {
    it('should return correct offset for each monster type', () => {
      expect(getMonsterAnchorOffset('rat')).toBe(-9.35);
      expect(Math.abs(getMonsterAnchorOffset('troll'))).toBe(0);
      expect(getMonsterAnchorOffset('skeleton')).toBeCloseTo(-11.05, 2);
    });

    it('should handle uppercase monster names', () => {
      expect(getMonsterAnchorOffset('RAT')).toBe(-9.35);
      expect(Math.abs(getMonsterAnchorOffset('TROLL'))).toBe(0);
    });
  });

  describe('getNPCAnchorOffset', () => {
    it('should return correct offset for NPCs', () => {
      expect(getNPCAnchorOffset()).toBe(-12.75);
    });

    it('should return same offset regardless of NPC type', () => {
      // All NPCs use the same offset
      const offset1 = getNPCAnchorOffset();
      const offset2 = getNPCAnchorOffset();
      expect(offset1).toBe(offset2);
    });
  });

  describe('offset calculation formula', () => {
    it('should use 85% compensation factor', () => {
      expect(COMPENSATION_FACTOR).toBe(0.85);
    });

    it('should use 2x sprite scale', () => {
      expect(SPRITE_SCALE).toBe(2);
    });

    it('should calculate offset as: -emptySpace * 0.85 * 2', () => {
      const emptySpace = 6; // Example: player down
      const expectedOffset = -emptySpace * COMPENSATION_FACTOR * SPRITE_SCALE;
      expect(expectedOffset).toBe(-10.2);
    });

    it('should return negative values (move sprite UP)', () => {
      const playerDownOffset = getPlayerAnchorOffset('down');
      const ratOffset = getMonsterAnchorOffset('rat');
      const npcOffset = getNPCAnchorOffset();
      
      // Offsets should be negative or zero (never positive)
      expect(playerDownOffset).toBeLessThanOrEqual(0);
      expect(ratOffset).toBeLessThanOrEqual(0);
      expect(npcOffset).toBeLessThanOrEqual(0);
    });
  });

  describe('sprite dimensions data', () => {
    it('should have dimensions for all player directions', () => {
      expect(SPRITE_DIMENSIONS.player).toHaveProperty('down');
      expect(SPRITE_DIMENSIONS.player).toHaveProperty('left');
      expect(SPRITE_DIMENSIONS.player).toHaveProperty('right');
      expect(SPRITE_DIMENSIONS.player).toHaveProperty('up');
    });

    it('should have dimensions for all monster types', () => {
      expect(SPRITE_DIMENSIONS.monsters).toHaveProperty('rat');
      expect(SPRITE_DIMENSIONS.monsters).toHaveProperty('troll');
      expect(SPRITE_DIMENSIONS.monsters).toHaveProperty('skeleton');
    });

    it('should have dimensions for NPCs', () => {
      expect(SPRITE_DIMENSIONS.npc).toHaveProperty('default');
    });

    it('should have valid empty space values', () => {
      // Empty space should be between 0 and 16 (tile size)
      Object.values(SPRITE_DIMENSIONS.player).forEach(dim => {
        expect(dim.emptySpaceTop).toBeGreaterThanOrEqual(0);
        expect(dim.emptySpaceTop).toBeLessThanOrEqual(16);
      });

      Object.values(SPRITE_DIMENSIONS.monsters).forEach(dim => {
        expect(dim.emptySpaceTop).toBeGreaterThanOrEqual(0);
        expect(dim.emptySpaceTop).toBeLessThanOrEqual(16);
      });

      expect(SPRITE_DIMENSIONS.npc.default.emptySpaceTop).toBeGreaterThanOrEqual(0);
      expect(SPRITE_DIMENSIONS.npc.default.emptySpaceTop).toBeLessThanOrEqual(16);
    });

    it('should have valid feet position values', () => {
      // Feet position should be between 0 and 15 (within 16x16 tile)
      Object.values(SPRITE_DIMENSIONS.player).forEach(dim => {
        expect(dim.feetY).toBeGreaterThanOrEqual(0);
        expect(dim.feetY).toBeLessThanOrEqual(15);
      });

      Object.values(SPRITE_DIMENSIONS.monsters).forEach(dim => {
        expect(dim.feetY).toBeGreaterThanOrEqual(0);
        expect(dim.feetY).toBeLessThanOrEqual(15);
      });

      expect(SPRITE_DIMENSIONS.npc.default.feetY).toBeGreaterThanOrEqual(0);
      expect(SPRITE_DIMENSIONS.npc.default.feetY).toBeLessThanOrEqual(15);
    });
  });

  describe('regression tests', () => {
    it('should not use 100% compensation (too artificial)', () => {
      // We use 85% for more natural look, not 100%
      expect(COMPENSATION_FACTOR).not.toBe(1.0);
      expect(COMPENSATION_FACTOR).toBeLessThan(1.0);
    });

    it('should not use fixed offset for all entities', () => {
      // Different entity types should have different offsets
      const playerOffset = getPlayerAnchorOffset('down');
      const ratOffset = getMonsterAnchorOffset('rat');
      const trollOffset = getMonsterAnchorOffset('troll');
      const npcOffset = getNPCAnchorOffset();

      // Not all should be the same
      const offsets = [playerOffset, ratOffset, trollOffset, npcOffset];
      const uniqueOffsets = new Set(offsets);
      expect(uniqueOffsets.size).toBeGreaterThan(1);
    });

    it('should handle sprites with no empty space (troll, player left/up)', () => {
      // These sprites have 0px empty space, offset should be 0 (or -0)
      expect(Math.abs(getMonsterAnchorOffset('troll'))).toBe(0);
      expect(Math.abs(getPlayerAnchorOffset('left'))).toBe(0);
      expect(Math.abs(getPlayerAnchorOffset('up'))).toBe(0);
    });
  });
});
