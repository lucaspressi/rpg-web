/**
 * Entity Anchor Offset System
 * 
 * This module calculates precise vertical offsets for entity sprites based on pixel-perfect
 * analysis of sprite dimensions. Different sprites have different amounts of empty space
 * at the top, and this system compensates for that to create natural-looking positioning.
 * 
 * Analysis Results (from sprite pixel analysis):
 * 
 * PLAYER SPRITES:
 * - DOWN/RIGHT: 6px empty space at top, feet at Y=15
 * - LEFT/UP: 0px empty space at top, feet at Y=11
 * 
 * MONSTER SPRITES:
 * - Rat: 5-6px empty space at top
 * - Troll: 0px empty space (full height sprite)
 * - Skeleton: 6-7px empty space at top
 * 
 * NPC SPRITES:
 * - 7-8px empty space at top
 * 
 * OFFSET CALCULATION:
 * - We use 85% of empty space (not 100%) for more natural appearance
 * - Offset is negative (moves sprite UP to compensate for empty space)
 * - Multiply by SPRITE_SCALE (2x) to convert tileset pixels to screen pixels
 */

import type { Direction } from '@/types/game';

/**
 * Sprite scale factor (2x)
 */
const SPRITE_SCALE = 2;

/**
 * Percentage of empty space to compensate (0.85 = 85%)
 * Using less than 100% makes sprites look more "grounded" and natural
 */
const COMPENSATION_FACTOR = 0.85;

/**
 * Sprite dimension data from pixel analysis
 * Values are in tileset coordinates (16x16 grid)
 */
const SPRITE_DIMENSIONS = {
  player: {
    down: { emptySpaceTop: 6, feetY: 15 },
    left: { emptySpaceTop: 0, feetY: 11 },
    right: { emptySpaceTop: 6, feetY: 15 },
    up: { emptySpaceTop: 0, feetY: 11 },
  },
  monsters: {
    rat: { emptySpaceTop: 5.5, feetY: 15 },      // Average of frames
    troll: { emptySpaceTop: 0, feetY: 11 },
    skeleton: { emptySpaceTop: 6.5, feetY: 15 },  // Average of frames
  },
  npc: {
    default: { emptySpaceTop: 7.5, feetY: 15 },  // Average of NPC sprites
  },
};

/**
 * Calculate vertical offset for an entity sprite
 * 
 * @param entityType - Type of entity ('player', 'monster', 'npc')
 * @param subtype - Subtype (monster name like 'rat', 'troll', or player direction)
 * @returns Vertical offset in screen pixels (negative value moves sprite UP)
 * 
 * @example
 * // Player facing down
 * const offset = getEntityAnchorOffset('player', 'down');
 * // Returns: -10.2 (6px * 0.85 * 2 scale)
 * 
 * @example
 * // Rat monster
 * const offset = getEntityAnchorOffset('monster', 'rat');
 * // Returns: -9.35 (5.5px * 0.85 * 2 scale)
 */
export function getEntityAnchorOffset(
  entityType: 'player' | 'monster' | 'npc',
  subtype?: string
): number {
  let emptySpaceTop = 0;

  switch (entityType) {
    case 'player': {
      const direction = (subtype || 'down') as keyof typeof SPRITE_DIMENSIONS.player;
      const dimensions = SPRITE_DIMENSIONS.player[direction] || SPRITE_DIMENSIONS.player.down;
      emptySpaceTop = dimensions.emptySpaceTop;
      break;
    }

    case 'monster': {
      const monsterType = (subtype || 'rat') as keyof typeof SPRITE_DIMENSIONS.monsters;
      const dimensions = SPRITE_DIMENSIONS.monsters[monsterType] || SPRITE_DIMENSIONS.monsters.rat;
      emptySpaceTop = dimensions.emptySpaceTop;
      break;
    }

    case 'npc': {
      emptySpaceTop = SPRITE_DIMENSIONS.npc.default.emptySpaceTop;
      break;
    }
  }

  // Calculate offset:
  // - Multiply by COMPENSATION_FACTOR (0.85) for natural look
  // - Multiply by SPRITE_SCALE (2) to convert tileset pixels to screen pixels
  // - Negate to move sprite UP (negative Y direction)
  const offset = -emptySpaceTop * COMPENSATION_FACTOR * SPRITE_SCALE;

  return offset;
}

/**
 * Get offset for player based on current direction
 */
export function getPlayerAnchorOffset(direction: Direction | string): number {
  return getEntityAnchorOffset('player', direction.toLowerCase());
}

/**
 * Get offset for monster based on monster type
 */
export function getMonsterAnchorOffset(monsterType: string): number {
  return getEntityAnchorOffset('monster', monsterType.toLowerCase());
}

/**
 * Get offset for NPC (all NPCs use same offset)
 */
export function getNPCAnchorOffset(): number {
  return getEntityAnchorOffset('npc');
}

/**
 * Export sprite dimensions for testing and debugging
 */
export { SPRITE_DIMENSIONS, COMPENSATION_FACTOR, SPRITE_SCALE };
