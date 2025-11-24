import { Position, Direction, Character, Tile } from '@/types/game';
import { MapSystem } from './MapSystem';

export class MovementSystem {
  static getNextPosition(position: Position, direction: Direction): Position {
    const newPos = { ...position };

    switch (direction) {
      case Direction.UP:
        newPos.y -= 1;
        break;
      case Direction.DOWN:
        newPos.y += 1;
        break;
      case Direction.LEFT:
        newPos.x -= 1;
        break;
      case Direction.RIGHT:
        newPos.x += 1;
        break;
    }

    return newPos;
  }

  static canMove(
    map: Tile[][],
    position: Position,
    direction: Direction,
    entities: Character[]
  ): boolean {
    const nextPos = this.getNextPosition(position, direction);

    // Verificar se o tile é caminhável
    if (!MapSystem.isWalkable(map, nextPos)) {
      return false;
    }

    // Verificar colisão com outras entidades
    const hasCollision = entities.some(
      (entity) =>
        entity.position.x === nextPos.x && entity.position.y === nextPos.y
    );

    return !hasCollision;
  }

  static moveCharacter(
    character: Character,
    direction: Direction,
    map: Tile[][],
    entities: Character[]
  ): Character {
    if (this.canMove(map, character.position, direction, entities)) {
      const newPosition = this.getNextPosition(character.position, direction);
      return {
        ...character,
        position: newPosition,
        direction,
      };
    }

    // Se não pode mover, apenas muda a direção
    return {
      ...character,
      direction,
    };
  }

  static getDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  static getDirectionTowards(from: Position, to: Position): Direction | null {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else if (dy !== 0) {
      return dy > 0 ? Direction.DOWN : Direction.UP;
    }

    return null;
  }
}
