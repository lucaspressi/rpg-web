import { Skill, SkillProjectile, SkillTarget } from '@/types/skill';
import { Player, Monster, Position } from '@/types/game';

export class SkillSystem {
  /**
   * Verifica se uma skill pode ser usada
   */
  static canUseSkill(
    skill: Skill,
    player: Player,
    lastUsed: number = 0
  ): { canUse: boolean; reason?: string } {
    if (!skill.unlocked) {
      return { canUse: false, reason: 'Skill não desbloqueada' };
    }

    if (player.mana < skill.manaCost) {
      return { canUse: false, reason: 'Mana insuficiente' };
    }

    const now = Date.now();
    const timeSinceLastUse = now - lastUsed;
    if (timeSinceLastUse < skill.cooldown) {
      const remaining = Math.ceil((skill.cooldown - timeSinceLastUse) / 1000);
      return { canUse: false, reason: `Cooldown: ${remaining}s` };
    }

    return { canUse: true };
  }

  /**
   * Usa uma skill e retorna o jogador atualizado
   */
  static useSkill(
    skill: Skill,
    player: Player
  ): Player {
    return {
      ...player,
      mana: player.mana - skill.manaCost,
    };
  }

  /**
   * Cria um projétil de skill
   */
  static createProjectile(
    skill: Skill,
    startPosition: Position,
    targetPosition: Position
  ): SkillProjectile {
    const damage = skill.damageRange
      ? Math.floor(
          Math.random() * (skill.damageRange[1] - skill.damageRange[0] + 1) +
            skill.damageRange[0]
        )
      : 0;

    return {
      id: `projectile-${Date.now()}-${Math.random()}`,
      skillId: skill.id,
      position: { ...startPosition },
      targetPosition: { ...targetPosition },
      speed: 0.3, // tiles por frame
      damage,
      sprite: skill.icon,
      createdAt: Date.now(),
    };
  }

  /**
   * Atualiza posição dos projéteis
   */
  static updateProjectiles(
    projectiles: SkillProjectile[],
    monsters: Monster[]
  ): {
    projectiles: SkillProjectile[];
    hits: Array<{ monsterId: string; damage: number }>;
  } {
    const hits: Array<{ monsterId: string; damage: number }> = [];
    const updatedProjectiles: SkillProjectile[] = [];

    for (const projectile of projectiles) {
      // Calcular direção
      const dx = projectile.targetPosition.x - projectile.position.x;
      const dy = projectile.targetPosition.y - projectile.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Se chegou no destino, remover
      if (distance < 0.5) {
        // Verificar colisão com monstros no destino
        const hitMonster = monsters.find(
          (m) =>
            Math.abs(m.position.x - projectile.targetPosition.x) <= 1 &&
            Math.abs(m.position.y - projectile.targetPosition.y) <= 1
        );

        if (hitMonster) {
          hits.push({
            monsterId: hitMonster.id,
            damage: projectile.damage,
          });
        }
        continue; // Não adicionar de volta aos projéteis
      }

      // Mover projétil
      const moveX = (dx / distance) * projectile.speed;
      const moveY = (dy / distance) * projectile.speed;

      updatedProjectiles.push({
        ...projectile,
        position: {
          x: projectile.position.x + moveX,
          y: projectile.position.y + moveY,
        },
      });
    }

    return { projectiles: updatedProjectiles, hits };
  }

  /**
   * Calcula distância entre duas posições
   */
  static getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Verifica se o alvo está no alcance da skill
   */
  static isInRange(
    playerPos: Position,
    targetPos: Position,
    skill: Skill
  ): boolean {
    return this.getDistance(playerPos, targetPos) <= skill.range;
  }
}
