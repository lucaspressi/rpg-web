import { Monster, Player, Tile, Direction } from '@/types/game';
import { MovementSystem } from './MovementSystem';

export class AISystem {
  static updateMonster(
    monster: Monster,
    player: Player,
    map: Tile[][],
    otherMonsters: Monster[]
  ): Monster {
    // Monstros não agressivos não perseguem o jogador
    if (!monster.aggressive) {
      return this.randomWalk(monster, map, [player, ...otherMonsters]);
    }

    // Calcular distância até o jogador
    const distance = MovementSystem.getDistance(monster.position, player.position);

    // Se estiver longe, não fazer nada
    if (distance > 8) {
      return monster;
    }

    // Se estiver perto, perseguir o jogador
    if (distance > 1) {
      const direction = MovementSystem.getDirectionTowards(
        monster.position,
        player.position
      );

      if (direction) {
        return MovementSystem.moveCharacter(
          monster,
          direction,
          map,
          [player, ...otherMonsters]
        ) as Monster;
      }
    }

    return monster;
  }

  private static randomWalk(
    monster: Monster,
    map: Tile[][],
    entities: any[]
  ): Monster {
    // 70% de chance de não se mover
    if (Math.random() < 0.7) {
      return monster;
    }

    // Escolher direção aleatória
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];

    return MovementSystem.moveCharacter(
      monster,
      randomDirection,
      map,
      entities
    ) as Monster;
  }

  static updateAllMonsters(
    monsters: Monster[],
    player: Player,
    map: Tile[][]
  ): Monster[] {
    return monsters.map((monster, index) => {
      const otherMonsters = monsters.filter((_, i) => i !== index);
      return this.updateMonster(monster, player, map, otherMonsters);
    });
  }
}
