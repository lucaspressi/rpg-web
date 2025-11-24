import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { TileType } from '@/types/game';

export default function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useGame();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const miniSize = 2; // pixels por tile
    const viewRange = 25; // tiles ao redor do jogador

    // Limpar
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const { player, monsters, map } = state;

    // Calcular área visível
    const startX = Math.max(0, player.position.x - viewRange);
    const startY = Math.max(0, player.position.y - viewRange);
    const endX = Math.min(map[0].length, player.position.x + viewRange);
    const endY = Math.min(map.length, player.position.y + viewRange);

    // Renderizar tiles
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const tile = map[y][x];
        const screenX = (x - startX) * miniSize;
        const screenY = (y - startY) * miniSize;

        let color = '#2d5016'; // grass
        switch (tile.type) {
          case TileType.STONE:
            color = '#5a5a5a';
            break;
          case TileType.WATER:
            color = '#1e3a8a';
            break;
          case TileType.WALL:
            color = '#3f3f3f';
            break;
          case TileType.DIRT:
            color = '#654321';
            break;
        }

        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, miniSize, miniSize);
      }
    }

    // Renderizar monstros
    monsters.forEach((monster) => {
      if (
        monster.position.x >= startX &&
        monster.position.x < endX &&
        monster.position.y >= startY &&
        monster.position.y < endY
      ) {
        const screenX = (monster.position.x - startX) * miniSize;
        const screenY = (monster.position.y - startY) * miniSize;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(screenX, screenY, miniSize, miniSize);
      }
    });

    // Renderizar player
    const playerScreenX = (player.position.x - startX) * miniSize;
    const playerScreenY = (player.position.y - startY) * miniSize;
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(playerScreenX, playerScreenY, miniSize, miniSize);
  }, [state]);

  return (
    <div className="game-panel p-3">
      <h3 className="pixel-font text-xs text-primary mb-2">Minimap</h3>
      <canvas
        ref={canvasRef}
        width={100}
        height={100}
        className="game-container border border-border"
      />
    </div>
  );
}
