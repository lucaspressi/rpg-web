import { describe, it, expect } from 'vitest';
import { getTileSprite, TILE_SPRITES } from './sprites';
import { TileType } from '@/types/game';

describe('Sprite System', () => {
  describe('TILE_SPRITES coordinates', () => {
    it('should have correct GRASS coordinates', () => {
      const grassSprites = TILE_SPRITES[TileType.GRASS];
      expect(grassSprites).toBeDefined();
      expect(grassSprites.length).toBe(4);
      
      // Verify all GRASS variants are in row 9 (plain grass, no decorations)
      grassSprites.forEach(sprite => {
        expect(sprite.y).toBe(9);
      });
      
      // Verify specific coordinates
      expect(grassSprites[0]).toEqual({ x: 7, y: 9, weight: 40 });
      expect(grassSprites[1]).toEqual({ x: 5, y: 9, weight: 30 });
      expect(grassSprites[2]).toEqual({ x: 8, y: 9, weight: 20 });
      expect(grassSprites[3]).toEqual({ x: 0, y: 9, weight: 10 });
    });

    it('should have correct WATER coordinates', () => {
      const waterSprites = TILE_SPRITES[TileType.WATER];
      expect(waterSprites).toBeDefined();
      expect(waterSprites.length).toBe(1);
      expect(waterSprites[0]).toEqual({ x: 4, y: 0 });
    });

    it('should have correct DIRT coordinates', () => {
      const dirtSprites = TILE_SPRITES[TileType.DIRT];
      expect(dirtSprites).toBeDefined();
      expect(dirtSprites.length).toBe(1);
      expect(dirtSprites[0]).toEqual({ x: 7, y: 0 });
    });

    it('should have correct STONE coordinates (light gray)', () => {
      const stoneSprites = TILE_SPRITES[TileType.STONE];
      expect(stoneSprites).toBeDefined();
      expect(stoneSprites.length).toBe(1);
      // Light gray/beige tile for visibility
      expect(stoneSprites[0]).toEqual({ x: 14, y: 1 });
    });

    it('should have correct WALL coordinates (light gray)', () => {
      const wallSprites = TILE_SPRITES[TileType.WALL];
      expect(wallSprites).toBeDefined();
      expect(wallSprites.length).toBe(1);
      // Light gray/beige tile for visibility
      expect(wallSprites[0]).toEqual({ x: 12, y: 1 });
    });
  });

  describe('getTileSprite', () => {
    it('should return correct sprite for GRASS', () => {
      const sprite = getTileSprite(TileType.GRASS, 0, 0);
      expect(sprite).toBeDefined();
      expect(sprite.sx).toBeGreaterThanOrEqual(0);
      expect(sprite.sy).toBe(9 * 16); // Row 9 (plain grass)
      expect(sprite.sw).toBe(16);
      expect(sprite.sh).toBe(16);
    });

    it('should return correct sprite for WATER', () => {
      const sprite = getTileSprite(TileType.WATER, 0, 0);
      expect(sprite).toEqual({
        sx: 4 * 16, // Column 4
        sy: 0 * 16, // Row 0
        sw: 16,
        sh: 16,
      });
    });

    it('should return correct sprite for DIRT', () => {
      const sprite = getTileSprite(TileType.DIRT, 0, 0);
      expect(sprite).toEqual({
        sx: 7 * 16, // Column 7
        sy: 0 * 16, // Row 0
        sw: 16,
        sh: 16,
      });
    });

    it('should return correct sprite for STONE (light gray)', () => {
      const sprite = getTileSprite(TileType.STONE, 0, 0);
      expect(sprite).toEqual({
        sx: 14 * 16, // Column 14
        sy: 1 * 16,  // Row 1
        sw: 16,
        sh: 16,
      });
    });

    it('should return correct sprite for WALL (light gray)', () => {
      const sprite = getTileSprite(TileType.WALL, 0, 0);
      expect(sprite).toEqual({
        sx: 12 * 16, // Column 12
        sy: 1 * 16,  // Row 1
        sw: 16,
        sh: 16,
      });
    });

    it('should return consistent sprites for same tile type', () => {
      const sprite1 = getTileSprite(TileType.WATER, 5, 5);
      const sprite2 = getTileSprite(TileType.WATER, 10, 10);
      expect(sprite1).toEqual(sprite2);
    });

    it('should use seeded random for GRASS variants', () => {
      // Same position should always return same variant
      const sprite1 = getTileSprite(TileType.GRASS, 5, 5);
      const sprite2 = getTileSprite(TileType.GRASS, 5, 5);
      expect(sprite1).toEqual(sprite2);

      // Different positions may return different variants
      const sprite3 = getTileSprite(TileType.GRASS, 10, 10);
      expect(sprite3.sy).toBe(9 * 16); // But all should be in row 9 (plain grass)
    });
  });

  describe('Sprite coordinate regression tests', () => {
    it('should NOT use water tiles for DIRT (bug fix)', () => {
      const dirtSprite = getTileSprite(TileType.DIRT, 0, 0);
      // DIRT should be (7,0) brown, NOT (3,2) which was blue water
      expect(dirtSprite.sx).toBe(7 * 16);
      expect(dirtSprite.sy).toBe(0 * 16);
    });

    it('should use light tiles for WALL/STONE (visibility fix)', () => {
      const stoneSprite = getTileSprite(TileType.STONE, 0, 0);
      const wallSprite = getTileSprite(TileType.WALL, 0, 0);
      
      // Should use light gray tiles (12,1) and (14,1), NOT dark (5,2) or (8,2)
      expect(stoneSprite.sx).toBe(14 * 16);
      expect(stoneSprite.sy).toBe(1 * 16);
      
      expect(wallSprite.sx).toBe(12 * 16);
      expect(wallSprite.sy).toBe(1 * 16);
    });

    it('should have distinct coordinates for each tile type', () => {
      const grass = getTileSprite(TileType.GRASS, 0, 0);
      const water = getTileSprite(TileType.WATER, 0, 0);
      const dirt = getTileSprite(TileType.DIRT, 0, 0);
      const stone = getTileSprite(TileType.STONE, 0, 0);
      const wall = getTileSprite(TileType.WALL, 0, 0);

      // All should have different source coordinates
      const coords = [grass, water, dirt, stone, wall].map(s => `${s.sx},${s.sy}`);
      const uniqueCoords = new Set(coords);
      
      // GRASS might share coords with other GRASS variants, but other types should be unique
      expect(uniqueCoords.size).toBeGreaterThanOrEqual(4);
    });
  });
});
