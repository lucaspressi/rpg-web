import { Tile, TileType } from '@/types/game';

/**
 * MapSystem - Structured Village Generator
 * Generates a complete village with walls, lake, temple, houses, and roads
 * Last updated: 2025-01-23 17:45:00 UTC
 * Cache-bust: v2.0.0
 */

interface MapConfig {
  lakeSize: number;
  safeZoneSize: number;
  templeSize: number;
  houseCount: number;
  stoneDecoration: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// VERSION: 2.0.1 - FORCE RELOAD
export class MapSystem {
  private static readonly DEFAULT_CONFIG: MapConfig = {
    lakeSize: 30,
    safeZoneSize: 20,
    templeSize: 6,
    houseCount: 4,
    stoneDecoration: 40,
  };

  /**
   * Main entry point - generates complete village map
   */
  static generateMap(
    width: number = 64,
    height: number = 64,
    config: Partial<MapConfig> = {}
  ): Tile[][] {
    const finalConfig: MapConfig = { ...this.DEFAULT_CONFIG, ...config };
    const raw = this.buildStructuredVillageMap(width, height, finalConfig);
    return this.convertToTileMap(raw, width, height);
  }

  /**
   * Build structured village map with all elements in exact order
   */
  private static buildStructuredVillageMap(
    width: number,
    height: number,
    config: MapConfig
  ): TileType[][] {
    console.log('[MapSystem v2.0.0] Building structured village map...');
    console.log(`[MapSystem] Dimensions: ${width}x${height}`);
    
    // Step 1: Initialize base GRASS map
    const map = this.initializeBaseMap(width, height);

    // Step 2: Add outer walls with gates
    const gateX = this.addOuterWallsWithGates(map);

    // Step 3: Add lake with shore at top
    this.addSimpleLakeWithShore(map);

    // Step 4: Add central safe zone
    const safe = this.addCentralSafeZone(map);

    // Step 5: Add central temple
    const temple = this.addCentralTemple(map, safe);

    // Step 6: Add NPC village houses
    const houses = this.addNPCVillageHouses(map, safe);

    // Step 7: Add roads connecting everything
    this.addRoads(map, gateX, safe, temple, houses);

    // Step 8: Add stone decorations
    this.addStoneDetails(map, safe, config.stoneDecoration);

    console.log('[MapSystem] Generated structured village map:');
    console.log(`  - Outer walls with gate at x=${gateX}`);
    console.log(`  - Lake at top with shore`);
    console.log(`  - Safe zone: ${safe.w}x${safe.h} at (${safe.x},${safe.y})`);
    console.log(`  - Temple: ${temple.w}x${temple.h} at (${temple.x},${temple.y})`);
    console.log(`  - ${houses.length} houses`);
    console.log(`  - Roads connecting all areas`);
    console.log(`  - ${config.stoneDecoration} stone decorations`);

    return map;
  }

  /**
   * Initialize base map filled with GRASS
   */
  private static initializeBaseMap(width: number, height: number): TileType[][] {
    const map: TileType[][] = [];
    for (let y = 0; y < height; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < width; x++) {
        row.push(TileType.GRASS);
      }
      map.push(row);
    }
    return map;
  }

  /**
   * Add outer walls with gates (north and south)
   * Returns gate X position for road alignment
   */
  private static addOuterWallsWithGates(map: TileType[][]): number {
    const width = map[0].length;
    const height = map.length;
    const gateX = Math.floor(width / 2);

    // Top wall with north gate
    for (let x = 0; x < width; x++) {
      if (x !== gateX && x !== gateX - 1) {
        map[0][x] = TileType.WALL;
      }
    }

    // Bottom wall with south gate
    for (let x = 0; x < width; x++) {
      if (x !== gateX && x !== gateX - 1) {
        map[height - 1][x] = TileType.WALL;
      }
    }

    // Left wall
    for (let y = 0; y < height; y++) {
      map[y][0] = TileType.WALL;
    }

    // Right wall
    for (let y = 0; y < height; y++) {
      map[y][width - 1] = TileType.WALL;
    }

    return gateX;
  }

  /**
   * Add simple lake with shore at top of map
   */
  private static addSimpleLakeWithShore(map: TileType[][]): void {
    const width = map[0].length;
    const lakeW = 20;
    const lakeH = 6;
    const lakeX = Math.floor((width - lakeW) / 2);
    const lakeY = 3;

    // Lake core (WATER)
    for (let y = lakeY; y < lakeY + lakeH; y++) {
      for (let x = lakeX; x < lakeX + lakeW; x++) {
        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
          map[y][x] = TileType.WATER;
        }
      }
    }

    // Shore (DIRT border around lake)
    for (let x = lakeX - 1; x <= lakeX + lakeW; x++) {
      if (x >= 0 && x < map[0].length) {
        // Top shore
        if (lakeY - 1 >= 0) map[lakeY - 1][x] = TileType.DIRT;
        // Bottom shore
        if (lakeY + lakeH < map.length) map[lakeY + lakeH][x] = TileType.DIRT;
      }
    }
    for (let y = lakeY; y < lakeY + lakeH; y++) {
      if (y >= 0 && y < map.length) {
        // Left shore
        if (lakeX - 1 >= 0) map[y][lakeX - 1] = TileType.DIRT;
        // Right shore
        if (lakeX + lakeW < map[0].length) map[y][lakeX + lakeW] = TileType.DIRT;
      }
    }
  }

  /**
   * Add central safe zone (DIRT area)
   * Returns safe zone rectangle
   */
  private static addCentralSafeZone(map: TileType[][]): Rect {
    const width = map[0].length;
    const height = map.length;
    const safeW = 24;
    const safeH = 16;
    const safeX = Math.floor((width - safeW) / 2);
    const safeY = Math.floor((height - safeH) / 2);

    for (let y = safeY; y < safeY + safeH; y++) {
      for (let x = safeX; x < safeX + safeW; x++) {
        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
          map[y][x] = TileType.DIRT;
        }
      }
    }

    return { x: safeX, y: safeY, w: safeW, h: safeH };
  }

  /**
   * Add central temple (WALL structure with DIRT floor)
   * Returns temple rectangle
   */
  private static addCentralTemple(map: TileType[][], safe: Rect): Rect {
    const templeW = 8;
    const templeH = 6;
    const templeX = safe.x + Math.floor((safe.w - templeW) / 2);
    const templeY = safe.y + Math.floor((safe.h - templeH) / 2);

    // Temple floor (DIRT)
    for (let y = templeY; y < templeY + templeH; y++) {
      for (let x = templeX; x < templeX + templeW; x++) {
        if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
          map[y][x] = TileType.DIRT;
        }
      }
    }

    // Temple walls (WALL)
    for (let x = templeX; x < templeX + templeW; x++) {
      if (x >= 0 && x < map[0].length) {
        // Top wall
        if (templeY >= 0 && templeY < map.length) map[templeY][x] = TileType.WALL;
        // Bottom wall
        if (templeY + templeH - 1 >= 0 && templeY + templeH - 1 < map.length) {
          map[templeY + templeH - 1][x] = TileType.WALL;
        }
      }
    }
    for (let y = templeY; y < templeY + templeH; y++) {
      if (y >= 0 && y < map.length) {
        // Left wall
        if (templeX >= 0 && templeX < map[0].length) map[y][templeX] = TileType.WALL;
        // Right wall
        if (templeX + templeW - 1 >= 0 && templeX + templeW - 1 < map[0].length) {
          map[y][templeX + templeW - 1] = TileType.WALL;
        }
      }
    }

    // Temple entrance (south side, center)
    const doorX = templeX + Math.floor(templeW / 2);
    const doorY = templeY + templeH - 1;
    if (doorY >= 0 && doorY < map.length && doorX >= 0 && doorX < map[0].length) {
      map[doorY][doorX] = TileType.DIRT;
    }

    return { x: templeX, y: templeY, w: templeW, h: templeH };
  }

  /**
   * Add NPC village houses around safe zone
   * Returns array of house rectangles
   */
  private static addNPCVillageHouses(map: TileType[][], safe: Rect): Rect[] {
    const houses: Rect[] = [];
    const houseW = 5;
    const houseH = 4;
    const spacing = 2;

    // House positions (4 houses around safe zone)
    const positions = [
      // Top-left
      { x: safe.x + spacing, y: safe.y + spacing },
      // Top-right
      { x: safe.x + safe.w - houseW - spacing, y: safe.y + spacing },
      // Bottom-left
      { x: safe.x + spacing, y: safe.y + safe.h - houseH - spacing },
      // Bottom-right
      { x: safe.x + safe.w - houseW - spacing, y: safe.y + safe.h - houseH - spacing },
    ];

    for (const pos of positions) {
      // House floor (DIRT)
      for (let y = pos.y; y < pos.y + houseH; y++) {
        for (let x = pos.x; x < pos.x + houseW; x++) {
          if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
            map[y][x] = TileType.DIRT;
          }
        }
      }

      // House walls (WALL)
      for (let x = pos.x; x < pos.x + houseW; x++) {
        if (x >= 0 && x < map[0].length) {
          // Top wall
          if (pos.y >= 0 && pos.y < map.length) map[pos.y][x] = TileType.WALL;
          // Bottom wall
          if (pos.y + houseH - 1 >= 0 && pos.y + houseH - 1 < map.length) {
            map[pos.y + houseH - 1][x] = TileType.WALL;
          }
        }
      }
      for (let y = pos.y; y < pos.y + houseH; y++) {
        if (y >= 0 && y < map.length) {
          // Left wall
          if (pos.x >= 0 && pos.x < map[0].length) map[y][pos.x] = TileType.WALL;
          // Right wall
          if (pos.x + houseW - 1 >= 0 && pos.x + houseW - 1 < map[0].length) {
            map[y][pos.x + houseW - 1] = TileType.WALL;
          }
        }
      }

      // House door (south side, center)
      const doorX = pos.x + Math.floor(houseW / 2);
      const doorY = pos.y + houseH - 1;
      if (doorY >= 0 && doorY < map.length && doorX >= 0 && doorX < map[0].length) {
        map[doorY][doorX] = TileType.DIRT;
      }

      houses.push({ x: pos.x, y: pos.y, w: houseW, h: houseH });
    }

    return houses;
  }

  /**
   * Add roads (DIRT paths) connecting gates, safe zone, temple, and houses
   */
  private static addRoads(
    map: TileType[][],
    gateX: number,
    safe: Rect,
    temple: Rect,
    houses: Rect[]
  ): void {
    const width = map[0].length;
    const height = map.length;

    // Main vertical road from north gate to south gate
    for (let y = 0; y < height; y++) {
      if (gateX >= 0 && gateX < width && y >= 0 && y < height) {
        if (map[y][gateX] !== TileType.WATER && map[y][gateX] !== TileType.WALL) {
          map[y][gateX] = TileType.DIRT;
        }
      }
    }

    // Horizontal road through safe zone center
    const centerY = safe.y + Math.floor(safe.h / 2);
    for (let x = safe.x; x < safe.x + safe.w; x++) {
      if (x >= 0 && x < width && centerY >= 0 && centerY < height) {
        if (map[centerY][x] !== TileType.WATER && map[centerY][x] !== TileType.WALL) {
          map[centerY][x] = TileType.DIRT;
        }
      }
    }

    // Vertical road through safe zone center
    const centerX = safe.x + Math.floor(safe.w / 2);
    for (let y = safe.y; y < safe.y + safe.h; y++) {
      if (centerX >= 0 && centerX < width && y >= 0 && y < height) {
        if (map[y][centerX] !== TileType.WATER && map[y][centerX] !== TileType.WALL) {
          map[y][centerX] = TileType.DIRT;
        }
      }
    }
  }

  /**
   * Add stone decorations scattered around safe zone
   */
  private static addStoneDetails(map: TileType[][], safe: Rect, count: number): void {
    let placed = 0;
    const maxAttempts = count * 3;
    let attempts = 0;

    while (placed < count && attempts < maxAttempts) {
      attempts++;

      // Random position outside safe zone but inside map
      const x = Math.floor(Math.random() * map[0].length);
      const y = Math.floor(Math.random() * map.length);

      // Check if position is valid (GRASS only, outside safe zone)
      if (
        x >= 0 &&
        x < map[0].length &&
        y >= 0 &&
        y < map.length &&
        map[y][x] === TileType.GRASS &&
        (x < safe.x || x >= safe.x + safe.w || y < safe.y || y >= safe.y + safe.h)
      ) {
        map[y][x] = TileType.STONE;
        placed++;
      }
    }
  }

  /**
   * Convert TileType[][] to Tile[][] with full tile objects
   */
  private static convertToTileMap(
    raw: TileType[][],
    width: number,
    height: number
  ): Tile[][] {
    const map: Tile[][] = [];
    for (let y = 0; y < height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < width; x++) {
        const type = raw[y][x];
        row.push({
          type,
          walkable: type !== TileType.WATER && type !== TileType.WALL,
          position: { x, y },
        });
      }
      map.push(row);
    }
    return map;
  }

  /**
   * Check if a position on the map is walkable
   */
  static isWalkable(map: Tile[][], position: { x: number; y: number }): boolean {
    const { x, y } = position;
    if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
      return false;
    }
    return map[y][x].walkable;
  }

  /**
   * Get map statistics (for debugging)
   */
  static getMapStats(map: Tile[][]): {
    totalTiles: number;
    tileCount: Record<TileType, number>;
  } {
    const totalTiles = map.length * map[0].length;
    const tileCount: Record<TileType, number> = {
      [TileType.GRASS]: 0,
      [TileType.DIRT]: 0,
      [TileType.WATER]: 0,
      [TileType.STONE]: 0,
      [TileType.WALL]: 0,
    };

    for (const row of map) {
      for (const tile of row) {
        tileCount[tile.type]++;
      }
    }

    return { totalTiles, tileCount };
  }
}
