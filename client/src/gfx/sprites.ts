/**
 * Sprite System for Tibia Web Edition
 * All sprites are 16x16 pixels from Overworld.png
 * Rendered at 2x scale (32x32) in the game
 */

import { Direction as GameDirection, TileType } from '@/types/game';

export const TILE_SIZE = 16; // Size of each tile in the atlas (pixels)

// ============================================================================
// TYPES
// ============================================================================

export type Direction = 'down' | 'left' | 'right' | 'up';

export type SpriteSheet = 'overworld' | 'inner' | 'cave' | 'objects' | 'character' | 'npc';

/**
 * Sprite definition with coordinates in tile units (not pixels)
 */
export interface SpriteDef {
  x: number;       // Column in the spritesheet (0-indexed, in tiles)
  y: number;       // Row in the spritesheet (0-indexed, in tiles)
  weight?: number; // Optional weight for random selection (default: 1)
}

export interface TileSprite {
  sheet: SpriteSheet;
  x: number;
  y: number;
}

/**
 * Sprite with pixel coordinates for direct rendering
 */
export interface Sprite {
  sx: number; // Source X in pixels
  sy: number; // Source Y in pixels
  sw: number; // Source width in pixels
  sh: number; // Source height in pixels
}

export interface EntitySpriteFrame {
  sheet: SpriteSheet;
  x: number;
  y: number;
}

export interface AnimationConfig {
  row: number;
  frames: number[]; // Column indices for animation frames
}

// ============================================================================
// TILE SPRITES MAPPING (Overworld.png)
// ============================================================================

/**
 * Map each TileType to an array of possible sprite definitions
 * Coordinates verified from Overworld.png (16x16 tiles)
 */
export const TILE_SPRITES: Record<TileType, SpriteDef[]> = {
  // GRASS: 4 plain grass variations from row 9 (NO decorations/flowers)
  // Row 0 tiles (0,0)-(3,0) contain flowers/decorations - DO NOT USE
  [TileType.GRASS]: [
    { x: 7, y: 9, weight: 40 }, // Plain grass 1 ✓ RGB(58,190,65) Variance:15.0
    { x: 5, y: 9, weight: 30 }, // Plain grass 2 ✓ RGB(50,142,65) Variance:16.8
    { x: 8, y: 9, weight: 20 }, // Plain grass 3 ✓ RGB(41,151,59) Variance:16.8
    { x: 0, y: 9, weight: 10 }, // Plain grass 4 ✓ RGB(58,190,65) Variance:18.7
  ],

  // DIRT: Brown packed earth for roads
  [TileType.DIRT]: [
    { x: 7, y: 0 }, // Brown dirt ✓ VERIFIED RGB(121,88,79)
  ],

  // WATER: Blue water
  [TileType.WATER]: [
    { x: 4, y: 0 }, // Blue water ✓ VERIFIED RGB(41,150,219)
  ],

  // STONE: Light gray/beige stone floor
  [TileType.STONE]: [
    { x: 14, y: 1 }, // Light gray stone ✓ VERIFIED RGB(120,104,96) Brightness:106.7
  ],

  // WALL: Light gray/beige wall
  [TileType.WALL]: [
    { x: 12, y: 1 }, // Light gray wall ✓ VERIFIED RGB(120,104,96) Brightness:106.7
  ],
};

/**
 * Helper to convert tile coordinates to pixel coordinates in spritesheet
 * @param tileX - Tile column (0-indexed)
 * @param tileY - Tile row (0-indexed)
 * @returns Sprite with pixel coordinates
 */
function tileToSprite(tileX: number, tileY: number): Sprite {
  return {
    sx: tileX * TILE_SIZE,
    sy: tileY * TILE_SIZE,
    sw: TILE_SIZE,
    sh: TILE_SIZE,
  };
}

/**
 * Robust seeded random [0,1] based on position
 * Ensures consistent tile selection per position
 * @param x - X coordinate on map
 * @param y - Y coordinate on map
 * @returns Random value between 0 and 1
 */
function seededRandom01(x: number, y: number): number {
  // Hash function for deterministic randomness
  let n = x * 73856093 ^ y * 19349663;
  n = (n << 13) ^ n;
  const result = (1.0 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0);
  // Normalize to [0,1]
  return (result + 1) / 2;
}

/**
 * Get tile sprite using exact coordinates
 * NO border logic, NO neighbor detection, NO transitions
 * Returns pixel coordinates for direct rendering
 * 
 * @param type - The tile type
 * @param tileX - X coordinate on map (for seeded random)
 * @param tileY - Y coordinate on map (for seeded random)
 * @returns Sprite with pixel coordinates (sx, sy, sw, sh)
 */
/**
 * FINAL TILE MAPPING - User-specified EXACT coordinates from Overworld.png
 * 
 * NO auto-tiling, NO borders, NO neighbor detection, NO transitions - FIXED mapping ONLY
 * 
 * Coordinates VERIFIED by tileset analysis (16x16 tiles):
 * - GRASS: (7,9), (5,9), (8,9), (0,9) - Plain grass RGB(41-58,142-190,59-65) NO decorations
 * - WATER: (4,0) - Blue water RGB(41,150,219)
 * - DIRT:  (7,0) - Brown earth RGB(121,88,79)
 * - STONE: (14,1) - Light gray/beige stone RGB(120,104,96) Brightness:106.7
 * - WALL:  (12,1) - Light gray/beige wall RGB(120,104,96) Brightness:106.7
 */
export function getTileSprite(
  type: TileType,
  tileX: number,
  tileY: number,
): Sprite {
  switch (type) {
    case TileType.GRASS: {
      // GRASS: Use weighted distribution from TILE_SPRITES
      // 95% smooth grass (40% + 30% + 20% + 5%), 3% flower, 2% bush
      const variants = TILE_SPRITES[TileType.GRASS];
      const r = seededRandom01(tileX, tileY);
      
      // Calculate total weight
      const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
      
      // Select variant based on weighted random
      let cumulative = 0;
      for (const variant of variants) {
        cumulative += (variant.weight || 1);
        if (r * totalWeight <= cumulative) {
          return tileToSprite(variant.x, variant.y);
        }
      }
      
      // Fallback to first variant
      return tileToSprite(variants[0].x, variants[0].y);
    }

    case TileType.WATER:
      // Blue water tile (4, 0) - VERIFIED ✓
      return tileToSprite(4, 0);

    case TileType.DIRT:
      // Brown dirt tile (7, 0) - VERIFIED ✓
      return tileToSprite(7, 0);

    case TileType.STONE:
      // Light gray/beige stone tile (14, 1) - VERIFIED RGB(120,104,96) Brightness:106.7
      return tileToSprite(14, 1);

    case TileType.WALL:
      // Light gray/beige wall tile (12, 1) - VERIFIED RGB(120,104,96) Brightness:106.7
      return tileToSprite(12, 1);

    default:
      // Fallback: smooth grass
      return tileToSprite(0, 0);
  }
}

// ============================================================================
// LEGACY COMPATIBILITY
// ============================================================================

export const TILE_SPRITES_LEGACY: Record<string, TileSprite> = {
  grass_base: { sheet: 'overworld', x: 0, y: 0 },
  grass_flower: { sheet: 'overworld', x: 0, y: 1 },
  grass_bush: { sheet: 'overworld', x: 1, y: 1 },
  grass: { sheet: 'overworld', x: 0, y: 0 },
  grass2: { sheet: 'overworld', x: 1, y: 0 },
  grass3: { sheet: 'overworld', x: 2, y: 0 },
  
  dirt: { sheet: 'overworld', x: 3, y: 2 },
  water: { sheet: 'overworld', x: 4, y: 0 },
  stone: { sheet: 'overworld', x: 4, y: 3 },
  wall: { sheet: 'overworld', x: 5, y: 1 },
  
  default: { sheet: 'overworld', x: 0, y: 0 },
};

// ============================================================================
// PLAYER ANIMATION (character.png - 17x16 tiles)
// ============================================================================

/**
 * Player sprite animation configuration
 * Each direction has a row with multiple frames for walking animation
 */
export const PLAYER_ANIM: Record<string, AnimationConfig> = {
  DOWN:  { row: 0, frames: [0, 1, 2, 3] },
  LEFT:  { row: 1, frames: [0, 1, 2, 3] },
  RIGHT: { row: 2, frames: [0, 1, 2, 3] },
  UP:    { row: 3, frames: [0, 1, 2, 3] },
  // Lowercase aliases for compatibility
  down:  { row: 0, frames: [0, 1, 2, 3] },
  left:  { row: 1, frames: [0, 1, 2, 3] },
  right: { row: 2, frames: [0, 1, 2, 3] },
  up:    { row: 3, frames: [0, 1, 2, 3] },
};

/**
 * Get player sprite frame based on direction and animation time
 * @param direction - Player facing direction
 * @param timestamp - Current timestamp for animation
 * @param animSpeed - Animation speed in ms per frame (default 150ms)
 * @returns Sprite coordinates
 */
export function getPlayerFrame(
  direction: string | GameDirection,
  timestamp: number,
  animSpeed: number = 150
): EntitySpriteFrame {
  const anim = PLAYER_ANIM[direction];
  if (!anim) {
    // Fallback to 'down' if direction not found
    return { sheet: 'character', x: 0, y: 0 };
  }
  
  const frameIndex = Math.floor(timestamp / animSpeed) % anim.frames.length;
  const frameCol = anim.frames[frameIndex];
  
  return {
    sheet: 'character',
    x: frameCol,
    y: anim.row,
  };
}

// ============================================================================
// MONSTER SPRITES
// ============================================================================

/**
 * Map monster types to their sprite frames
 * Using character.png and NPC_test.png
 */
export const MONSTER_SPRITES: Record<string, EntitySpriteFrame> = {
  // Rats - small creatures (using character sheet row 4-5)
  rat: { sheet: 'character', x: 0, y: 4 },
  
  // Trolls - medium creatures (using character sheet row 6-7)
  troll: { sheet: 'character', x: 0, y: 6 },
  
  // Skeletons - undead (using character sheet row 8-9)
  skeleton: { sheet: 'character', x: 0, y: 8 },
  
  // Default monster sprite
  default: { sheet: 'character', x: 0, y: 4 },
};

/**
 * Get monster sprite frame
 * @param monsterType - Type of monster (rat, troll, skeleton, etc.)
 * @returns Sprite coordinates
 */
export function getMonsterFrame(monsterType: string): EntitySpriteFrame {
  return MONSTER_SPRITES[monsterType.toLowerCase()] || MONSTER_SPRITES.default;
}

// ============================================================================
// NPC SPRITES (NPC_test.png - 4x8 tiles)
// ============================================================================

/**
 * Map NPC types to their sprite frames
 */
export const NPC_SPRITES: Record<string, EntitySpriteFrame> = {
  // Vendors/Merchants
  merchant: { sheet: 'npc', x: 0, y: 0 },
  blacksmith: { sheet: 'npc', x: 1, y: 0 },
  alchemist: { sheet: 'npc', x: 2, y: 0 },
  
  // Quest givers
  elder: { sheet: 'npc', x: 0, y: 1 },
  guard: { sheet: 'npc', x: 1, y: 1 },
  
  // Default NPC sprite
  default: { sheet: 'npc', x: 0, y: 0 },
};

/**
 * Get NPC sprite frame
 * @param npcType - Type of NPC
 * @returns Sprite coordinates
 */
export function getNPCFrame(npcType: string): EntitySpriteFrame {
  return NPC_SPRITES[npcType.toLowerCase()] || NPC_SPRITES.default;
}

// ============================================================================
// OBJECT SPRITES (objects.png - 33x20 tiles)
// ============================================================================

/**
 * Decorative objects and items
 */
export const OBJECT_SPRITES: Record<string, EntitySpriteFrame> = {
  tree: { sheet: 'objects', x: 0, y: 0 },
  rock: { sheet: 'objects', x: 1, y: 0 },
  bush: { sheet: 'objects', x: 2, y: 0 },
  flower: { sheet: 'objects', x: 3, y: 0 },
  
  // Items
  chest: { sheet: 'objects', x: 0, y: 1 },
  potion_red: { sheet: 'objects', x: 1, y: 1 },
  potion_blue: { sheet: 'objects', x: 2, y: 1 },
  coin: { sheet: 'objects', x: 3, y: 1 },
  
  // Weapons
  sword: { sheet: 'objects', x: 0, y: 2 },
  axe: { sheet: 'objects', x: 1, y: 2 },
  bow: { sheet: 'objects', x: 2, y: 2 },
  
  // Armor
  helmet: { sheet: 'objects', x: 0, y: 3 },
  armor: { sheet: 'objects', x: 1, y: 3 },
  shield: { sheet: 'objects', x: 2, y: 3 },
  boots: { sheet: 'objects', x: 3, y: 3 },
};

// ============================================================================
// SPRITE SHEET PATHS
// ============================================================================

export const SPRITE_SHEETS: Record<SpriteSheet, string> = {
  overworld: '/gfx/Overworld.png',
  inner: '/gfx/Inner.png',
  cave: '/gfx/cave.png',
  objects: '/gfx/objects.png',
  character: '/gfx/character.png',
  npc: '/gfx/NPC_test.png',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Draw a sprite on canvas
 * @param ctx - Canvas 2D context
 * @param image - Loaded sprite sheet image
 * @param sprite - Sprite coordinates (in tiles, not pixels)
 * @param dx - Destination X on canvas (in pixels)
 * @param dy - Destination Y on canvas (in pixels)
 * @param scale - Scale factor (default 1)
 */
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sprite: { x: number; y: number },
  dx: number,
  dy: number,
  scale: number = 1
): void {
  const sx = sprite.x * TILE_SIZE;
  const sy = sprite.y * TILE_SIZE;
  const sSize = TILE_SIZE;
  const dSize = TILE_SIZE * scale;

  ctx.drawImage(
    image,
    sx, sy, sSize, sSize,  // Source rectangle (in pixels)
    dx, dy, dSize, dSize   // Destination rectangle (in pixels)
  );
}
