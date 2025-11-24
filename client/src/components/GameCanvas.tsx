import { useRef, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useClickToMove } from '@/hooks/game/useClickToMove';
import { useImages } from '@/hooks/useImage';
import { GAME_CONFIG, COLORS } from '@/data/gameConfig';
import { TileType, Direction } from '@/types/game';
import { NPCType } from '@/types/npc';
import { SAFE_ZONES } from '@/data/safeZones';
import {
  SPRITE_SHEETS,
  TILE_SIZE as SPRITE_TILE_SIZE,
  TILE_SPRITES,
  getPlayerFrame,
  getMonsterFrame,
  getNPCFrame,
  getTileSprite,
  drawSprite,
} from '@/gfx/sprites';
import { getPlayerAnchorOffset, getMonsterAnchorOffset, getNPCAnchorOffset } from '@/gfx/anchor-offset';

const { TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } = GAME_CONFIG;
const SPRITE_SCALE = TILE_SIZE / SPRITE_TILE_SIZE; // 32/16 = 2x scale

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();
  const { setDestination } = useClickToMove();
  
  // Load all sprite sheets
  const sprites = useImages({
    overworld: SPRITE_SHEETS.overworld,
    character: SPRITE_SHEETS.character,
    npc: SPRITE_SHEETS.npc,
    objects: SPRITE_SHEETS.objects,
  });

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Converter coordenadas de tela para coordenadas do mapa
    const offsetX = Math.floor(state.camera.x - VIEWPORT_WIDTH / 2);
    const offsetY = Math.floor(state.camera.y - VIEWPORT_HEIGHT / 2);
    const tileX = Math.floor(clickX / TILE_SIZE) + offsetX;
    const tileY = Math.floor(clickY / TILE_SIZE) + offsetY;

    // Verificar se o tile é walkable
    if (tileY >= 0 && tileY < state.map.length && tileX >= 0 && tileX < state.map[0].length) {
      const tile = state.map[tileY][tileX];
      if (tile.walkable) {
        setDestination({ x: tileX, y: tileY });
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Wait for sprites to load
    const allSpritesLoaded = sprites.overworld && sprites.character && sprites.npc;
    if (!allSpritesLoaded) {
      // Show loading state
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '20px VT323';
      ctx.textAlign = 'center';
      ctx.fillText('Loading sprites...', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;

    // Limpar canvas
    ctx.fillStyle = COLORS.GRASS;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { player, monsters, npcs, map, camera } = state;

    // Calcular offset da câmera
    const offsetX = Math.floor(camera.x - VIEWPORT_WIDTH / 2);
    const offsetY = Math.floor(camera.y - VIEWPORT_HEIGHT / 2);

    // ========================================================================
    // LAYER 1: Renderizar tiles com sprites
    // ========================================================================
    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
      for (let x = 0; x < VIEWPORT_WIDTH; x++) {
        const mapX = offsetX + x;
        const mapY = offsetY + y;

        if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
          const tile = map[mapY][mapX];
          const screenX = x * TILE_SIZE;
          const screenY = y * TILE_SIZE;

          // Get tile sprite using exact coordinates (returns pixel coordinates)
          const sprite = getTileSprite(tile.type, mapX, mapY);

          // Draw tile sprite directly with pixel coordinates
          if (sprites.overworld) {
            ctx.drawImage(
              sprites.overworld,
              sprite.sx,
              sprite.sy,
              sprite.sw,
              sprite.sh,
              screenX,
              screenY,
              sprite.sw * SPRITE_SCALE, // 32x32 (16 * 2)
              sprite.sh * SPRITE_SCALE,
            );
          }
        }
      }
    }

    // ========================================================================
    // LAYER 2: Renderizar entidades com Y-sorting (depth sorting)
    // ========================================================================
    // Unified entity system: combine all entities and sort by Y position
    // Entities further north (lower Y) are drawn first (appear behind)
    // Entities further south (higher Y) are drawn last (appear in front)
    
    type RenderEntity = {
      type: 'player' | 'monster' | 'npc' | 'otherPlayer';
      y: number; // For sorting
      data: any;
    };

    const entitiesToRender: RenderEntity[] = [];

    // Add local player
    entitiesToRender.push({
      type: 'player',
      y: player.position.y,
      data: player,
    });

    // Add monsters
    monsters.forEach((monster) => {
      entitiesToRender.push({
        type: 'monster',
        y: monster.position.y,
        data: monster,
      });
    });

    // Add NPCs
    npcs.forEach((npc) => {
      entitiesToRender.push({
        type: 'npc',
        y: npc.position.y,
        data: npc,
      });
    });

    // Add other online players
    const multiplayerPlayers = state.multiplayer?.onlinePlayers || new Map();
    Object.values(multiplayerPlayers).forEach((otherPlayer) => {
      entitiesToRender.push({
        type: 'otherPlayer',
        y: otherPlayer.y,
        data: otherPlayer,
      });
    });

    // Sort entities by Y position (ascending = north to south)
    entitiesToRender.sort((a, b) => a.y - b.y);

    // Vertical offset calculation:
    // Each entity type has different sprite dimensions and empty space at top.
    // We use getEntityAnchorOffset() functions to calculate precise offsets based on
    // pixel-perfect analysis of each sprite type.
    // 
    // See client/src/gfx/anchor-offset.ts for detailed analysis and calculations.
    // Offsets are calculated dynamically per entity type and direction.

    // Render all entities in sorted order
    entitiesToRender.forEach((entity) => {
      const pos = entity.type === 'player' 
        ? entity.data.position 
        : entity.type === 'otherPlayer'
        ? { x: entity.data.x, y: entity.data.y }
        : entity.data.position;

      const screenX = (pos.x - offsetX) * TILE_SIZE;
      const screenY = (pos.y - offsetY) * TILE_SIZE;

      // Skip if outside viewport
      if (
        screenX < -TILE_SIZE ||
        screenX >= canvas.width ||
        screenY < -TILE_SIZE ||
        screenY >= canvas.height
      ) {
        return;
      }

      if (entity.type === 'monster') {
        const monster = entity.data;
        const isInRange = Math.abs(monster.position.x - player.position.x) + 
                         Math.abs(monster.position.y - player.position.y) <= 1;
        const isTarget = state.targetId === monster.id;

        // Highlight if target
        if (isTarget) {
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          ctx.setLineDash([]);
        }
        // Highlight if in range
        else if (isInRange) {
          ctx.strokeStyle = COLORS.PLAYER;
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX + 2, screenY + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        }

        // Draw monster sprite
        const monsterSprite = getMonsterFrame(monster.type || 'rat');
        if (sprites.character) {
          const monsterOffset = getMonsterAnchorOffset(monster.type || 'rat');
          drawSprite(ctx, sprites.character, monsterSprite, screenX, screenY + monsterOffset, SPRITE_SCALE);
        }
        
        // Debug overlays removed - offset calculation now based on sprite analysis

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '10px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(monster.name, screenX + TILE_SIZE / 2, screenY - 2);

        // HP bar
        const hpPercent = monster.hp / monster.maxHp;
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX + 4, screenY + TILE_SIZE - 6, TILE_SIZE - 8, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(screenX + 4, screenY + TILE_SIZE - 6, (TILE_SIZE - 8) * hpPercent, 4);
      }
      else if (entity.type === 'npc') {
        const npc = entity.data;

        // Draw NPC sprite
        const npcSprite = getNPCFrame(npc.type || 'merchant');
        if (sprites.npc) {
          const npcOffset = getNPCAnchorOffset();
          drawSprite(ctx, sprites.npc, npcSprite, screenX, screenY + npcOffset, SPRITE_SCALE);
        }

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '10px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, screenX + TILE_SIZE / 2, screenY - 2);
        
        // Quest indicator
        if (npc.type === NPCType.QUEST_GIVER || npc.dialogue) {
          ctx.fillStyle = '#fbbf24';
          ctx.font = 'bold 16px Arial';
          ctx.fillText('!', screenX + TILE_SIZE / 2, screenY + TILE_SIZE + 10);
        }
      }
      else if (entity.type === 'player') {
        const playerData = entity.data;

        // Get animated player frame
        const playerFrame = getPlayerFrame(playerData.direction, Date.now());
        if (sprites.character) {
          const playerOffset = getPlayerAnchorOffset(playerData.direction);
          drawSprite(ctx, sprites.character, playerFrame, screenX, screenY + playerOffset, SPRITE_SCALE);
        }

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '10px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(playerData.name, screenX + TILE_SIZE / 2, screenY - 2);
      }
      else if (entity.type === 'otherPlayer') {
        const otherPlayer = entity.data;

        // Draw other player sprite
        const direction = (otherPlayer.direction as Direction) || 'down';
        const otherPlayerFrame = getPlayerFrame(direction, Date.now());
        if (sprites.character) {
          ctx.save();
          ctx.globalAlpha = 0.9;
          const otherPlayerOffset = getPlayerAnchorOffset(otherPlayer.direction || 'down');
          drawSprite(ctx, sprites.character, otherPlayerFrame, screenX, screenY + otherPlayerOffset, SPRITE_SCALE);
          ctx.restore();
        }

        // Name and level
        ctx.fillStyle = '#7dd3fc';
        ctx.font = '10px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(`${otherPlayer.name} [${otherPlayer.level}]`, screenX + TILE_SIZE / 2, screenY - 2);

        // HP bar
        const hpPercent = otherPlayer.hp / otherPlayer.maxHp;
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX + 4, screenY + TILE_SIZE - 6, TILE_SIZE - 8, 4);
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(screenX + 4, screenY + TILE_SIZE - 6, (TILE_SIZE - 8) * hpPercent, 4);
      }
    });

    // ========================================================================
    // LAYER 3: Renderizar projéteis (sempre acima de entidades)
    // ========================================================================
    state.projectiles.forEach((projectile) => {
      const screenX = (projectile.position.x - offsetX) * TILE_SIZE;
      const screenY = (projectile.position.y - offsetY) * TILE_SIZE;

      if (
        screenX >= -TILE_SIZE &&
        screenX < canvas.width &&
        screenY >= -TILE_SIZE &&
        screenY < canvas.height
      ) {
        // Desenhar projétil (emoji)
        ctx.font = `${TILE_SIZE * 0.8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra para destaque
        ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillText(projectile.sprite, screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2);
        ctx.shadowBlur = 0;
      }
    });



    // ========================================================================
    // LAYER 4: Renderizar damage texts
    // ========================================================================
    const now = Date.now();
    state.damageTexts.forEach((damageText) => {
      const age = now - damageText.timestamp;
      const progress = age / 1000; // 0 to 1 over 1 second
      
      if (progress < 1) {
        const screenX = (damageText.position.x - offsetX) * TILE_SIZE + TILE_SIZE / 2;
        const screenY = (damageText.position.y - offsetY) * TILE_SIZE - progress * 30;
        
        ctx.save();
        ctx.globalAlpha = 1 - progress;
        ctx.font = 'bold 16px VT323';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Sombra para melhor legibilidade
        ctx.fillStyle = '#000';
        ctx.fillText(`-${damageText.damage}`, screenX + 1, screenY + 1);
        
        // Cor baseada no tipo
        ctx.fillStyle = damageText.type === 'player' ? '#ff4444' : '#ffaa00';
        ctx.fillText(`-${damageText.damage}`, screenX, screenY);
        ctx.restore();
      }
    });



    // ========================================================================
    // LAYER 5: Renderizar zonas seguras (overlay)
    // ========================================================================
    SAFE_ZONES.forEach(zone => {
      const zoneScreenX = (zone.x - offsetX) * TILE_SIZE;
      const zoneScreenY = (zone.y - offsetY) * TILE_SIZE;
      const zoneWidth = zone.width * TILE_SIZE;
      const zoneHeight = zone.height * TILE_SIZE;

      // Verificar se a zona está na viewport
      if (
        zoneScreenX + zoneWidth >= 0 &&
        zoneScreenX < canvas.width &&
        zoneScreenY + zoneHeight >= 0 &&
        zoneScreenY < canvas.height
      ) {
        // Overlay verde semi-transparente
        ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
        ctx.fillRect(zoneScreenX, zoneScreenY, zoneWidth, zoneHeight);
        
        // Borda verde
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(zoneScreenX, zoneScreenY, zoneWidth, zoneHeight);
        
        // Texto "SAFE ZONE"
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
        ctx.font = 'bold 12px VT323';
        ctx.textAlign = 'center';
        ctx.fillText('SAFE ZONE', zoneScreenX + zoneWidth / 2, zoneScreenY + zoneHeight / 2);
      }
    });

  }, [state, sprites]);

  return (
    <canvas
      ref={canvasRef}
      width={VIEWPORT_WIDTH * TILE_SIZE}
      height={VIEWPORT_HEIGHT * TILE_SIZE}
      onClick={handleCanvasClick}
      className="border-4 border-primary rounded-lg cursor-crosshair"
      style={{ imageRendering: 'pixelated' }} // CSS hint for pixel-perfect rendering
    />
  );
}
