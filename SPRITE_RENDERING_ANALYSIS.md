# Sprite Rendering System Analysis - Tibia Web Edition

## 1. SPRITE DIMENSIONS

### Source (Tileset)
- **File:** `client/public/gfx/Overworld.png` and `character.png`
- **Tile Size:** 16x16 pixels (defined in `sprites.ts` line 9: `const TILE_SIZE = 16`)
- **All sprites:** 16x16 pixels in the tileset

### Destination (Screen)
- **Scale Factor:** 2x (defined in GameCanvas: `const SPRITE_SCALE = 2`)
- **Rendered Size:** 16 * 2 = **32x32 pixels** on screen
- **Tile Size on Screen:** Also 32x32 pixels (16 * 2)

**CONCLUSION:** Sprites and tiles have **identical dimensions** on screen (32x32).

---

## 2. DRAW SPRITE FUNCTION

**Location:** `client/src/gfx/sprites.ts` lines 383-401

```typescript
export function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sprite: { x: number; y: number },  // Tile coordinates (not pixels!)
  dx: number,  // Destination X in PIXELS
  dy: number,  // Destination Y in PIXELS
  scale: number = 1
): void {
  const sx = sprite.x * TILE_SIZE;  // Convert tile X to pixels: x * 16
  const sy = sprite.y * TILE_SIZE;  // Convert tile Y to pixels: y * 16
  const sSize = TILE_SIZE;          // Source size: 16x16
  const dSize = TILE_SIZE * scale;  // Dest size: 16 * 2 = 32x32

  ctx.drawImage(
    image,
    sx, sy, sSize, sSize,  // Source: Extract 16x16 from tileset
    dx, dy, dSize, dSize   // Dest: Draw 32x32 on screen
  );
}
```

### Key Points:
1. **Anchor Point:** `(dx, dy)` = **TOP-LEFT corner** of the sprite
2. **Source:** Always 16x16 pixels from tileset
3. **Destination:** Always 32x32 pixels on screen (with scale=2)

---

## 3. SCREEN POSITION CALCULATION

**Location:** `client/src/components/GameCanvas.tsx` lines 205-208

```typescript
const pos = entity.data.position;  // e.g., { x: 10, y: 10 } in TILE coordinates
const screenX = (pos.x - offsetX) * TILE_SIZE;  // (10 - 5) * 32 = 160px
const screenY = (pos.y - offsetY) * TILE_SIZE;  // (10 - 5) * 32 = 160px
```

### What does `screenX, screenY` represent?
- **screenX:** X position of the **TOP-LEFT corner** of the TILE
- **screenY:** Y position of the **TOP-LEFT corner** of the TILE

### Example:
- Entity at tile (10, 10)
- Camera offset (5, 5)
- **screenX** = (10 - 5) * 32 = **160px**
- **screenY** = (10 - 5) * 32 = **160px**
- Tile occupies: **160px to 192px** (width 32px) and **160px to 192px** (height 32px)

---

## 4. CURRENT RENDERING CODE

**Location:** `client/src/components/GameCanvas.tsx` line 234

```typescript
const ENTITY_VERTICAL_OFFSET = 0;
drawSprite(ctx, sprites.character, monsterSprite, screenX, screenY + ENTITY_VERTICAL_OFFSET, SPRITE_SCALE);
```

### What happens:
1. **Sprite drawn at:** `(screenX, screenY + 0)` = `(screenX, screenY)`
2. **Sprite top-left:** screenY (e.g., 160px)
3. **Sprite bottom-right:** screenY + 32 (e.g., 192px)
4. **Tile top-left:** screenY (e.g., 160px)
5. **Tile bottom-right:** screenY + 32 (e.g., 192px)

**RESULT:** Sprite and tile are **perfectly aligned** (both 32x32, both start at same position).

---

## 5. SYSTEM OF COORDINATES

### What does entity.position (x, y) represent?

Looking at the code:
- **Entity position:** Stored in TILE coordinates (e.g., x=10, y=10)
- **screenX/screenY:** Calculated as `(pos.x - offsetX) * TILE_SIZE`

**INTERPRETATION:**
- `entity.position` represents the **TILE** that the entity occupies
- The entity is drawn with its **top-left corner** at the **top-left corner** of that tile

### Is this correct for a Tibia-style game?

**NO!** In Tibia:
- Entity position should represent the **CENTER** or **BOTTOM-CENTER** of the entity
- Sprites should be drawn with their **feet** at the **bottom-center** of the tile
- This allows entities to "stand on" the tile, not "float above" it

---

## 6. PROBLEM IDENTIFICATION

### Current Behavior:
- Sprite top-left = Tile top-left
- Sprite occupies entire tile (32x32)
- **Feet of sprite** are at the **bottom of the tile**

### Why it looks "unnatural":
1. **No vertical offset:** Sprites look "flat" against the ground
2. **Anchor point wrong:** Should be bottom-center, not top-left
3. **No depth perception:** All entities at same "height" visually

### Tibia Original Behavior:
- Sprites are drawn with **bottom-center** as anchor
- Sprites can be **taller than one tile** (e.g., 16x24 or 16x32)
- Feet are positioned at the **center-bottom** of the tile
- This creates natural depth and "standing" appearance

---

## 7. SPRITE DIMENSIONS IN character.png

Need to verify: Are character sprites actually 16x16, or are they 16x24/16x32?

**Hypothesis:** Character sprites might have:
- **Width:** 16 pixels
- **Height:** 24 or 32 pixels (taller than tiles!)
- **Extra space** at top for head/hair

This would explain why offset=0 looks unnatural - we're treating 16x24 sprites as if they were 16x16!

---

## 8. PROPOSED SOLUTION

### Option A: If sprites are 16x16 (same as tiles)
- Keep offset = 0
- But adjust anchor point to **bottom-center** instead of top-left
- This requires changing the drawSprite call:
  ```typescript
  const spriteX = screenX;  // Left edge of tile
  const spriteY = screenY + TILE_SIZE - (TILE_SIZE * SPRITE_SCALE);  // Bottom of tile - sprite height
  drawSprite(ctx, image, sprite, spriteX, spriteY, SPRITE_SCALE);
  ```

### Option B: If sprites are 16x24 or taller
- Calculate offset based on actual sprite height:
  ```typescript
  const SPRITE_HEIGHT = 24;  // or 32, need to verify
  const ENTITY_VERTICAL_OFFSET = -(SPRITE_HEIGHT * SPRITE_SCALE - TILE_SIZE);
  // e.g., -(24*2 - 32) = -(48 - 32) = -16
  ```

### Option C: Hybrid approach (Recommended)
1. Measure actual sprite dimensions in character.png
2. Calculate offset to align **feet** with **bottom of tile**
3. Adjust anchor point to **bottom-center** for natural positioning

---

## 9. NEXT STEPS

1. **Extract and measure** actual character sprite from character.png
2. **Verify dimensions:** 16x16? 16x24? 16x32?
3. **Check for empty space** at top of sprite (head/hair area)
4. **Calculate correct offset** based on actual dimensions
5. **Implement anchor point adjustment** for bottom-center positioning
6. **Test visually** with debug overlays to confirm alignment

---

## 10. DEBUG VISUAL OVERLAYS (NOT WORKING)

Attempted to add debug overlays in GameCanvas.tsx lines 237-272:
- Blue square: Tile bounds
- Red rectangle: Sprite hitbox
- Green circle: Entity position
- Yellow circle: Sprite feet position
- Cyan line: Tile bottom

**STATUS:** Overlays not rendering (possible React/Canvas rendering issue)

**WORKAROUND:** Manual code analysis and mathematical calculation instead of visual debugging.
