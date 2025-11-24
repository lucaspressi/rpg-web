import { Player } from '@/types/game';
import { PvPFlag, PVP_CONFIG, PvPStatus } from '@/types/pvp';
import { isInSafeZone } from '@/data/safeZones';

export class PvPSystem {
  /**
   * Verifica se um jogador pode atacar outro
   */
  static canAttackPlayer(attacker: Player, targetPosition: { x: number; y: number }): {
    canAttack: boolean;
    reason?: string;
  } {
    // Verificar se está em cooldown
    if (!attacker.pvpStatus.canAttack) {
      return {
        canAttack: false,
        reason: 'You must wait before attacking again',
      };
    }

    // Verificar se atacante está em zona segura
    if (isInSafeZone(attacker.position.x, attacker.position.y)) {
      return {
        canAttack: false,
        reason: 'You cannot attack from a safe zone',
      };
    }

    // Verificar se alvo está em zona segura
    if (isInSafeZone(targetPosition.x, targetPosition.y)) {
      return {
        canAttack: false,
        reason: 'Target is in a safe zone',
      };
    }

    return { canAttack: true };
  }

  /**
   * Aplica flag de PvP ao atacante
   */
  static applyAttackerFlag(player: Player): PvPStatus {
    const now = Date.now();
    return {
      ...player.pvpStatus,
      flag: PvPFlag.ATTACKER,
      flagExpiration: now + PVP_CONFIG.FLAG_DURATION,
      lastAttackTime: now,
      canAttack: false, // Entra em cooldown
    };
  }

  /**
   * Aplica flag de vítima ao jogador atacado
   */
  static applyVictimFlag(player: Player, attackerId: number): PvPStatus {
    const now = Date.now();
    return {
      ...player.pvpStatus,
      flag: PvPFlag.VICTIM,
      flagExpiration: now + PVP_CONFIG.FLAG_DURATION,
      attackedBy: attackerId,
    };
  }

  /**
   * Atualiza o status PvP do jogador (remove flags expiradas, libera cooldown)
   */
  static updatePvPStatus(player: Player): PvPStatus {
    const now = Date.now();
    const status = { ...player.pvpStatus };

    // Remover flag se expirou
    if (status.flagExpiration && now >= status.flagExpiration) {
      status.flag = PvPFlag.NONE;
      status.flagExpiration = null;
      status.attackedBy = null;
    }

    // Liberar cooldown de ataque
    if (
      status.lastAttackTime &&
      now >= status.lastAttackTime + PVP_CONFIG.ATTACK_COOLDOWN
    ) {
      status.canAttack = true;
    }

    return status;
  }

  /**
   * Calcula dano de PvP (reduzido comparado a PvE)
   */
  static calculatePvPDamage(attacker: Player, defender: Player): number {
    // Dano base do atacante (com equipamentos)
    const baseDamage = attacker.level * 2; // Simplificado
    
    // Aplicar redução de dano PvP
    const pvpDamage = Math.floor(baseDamage * PVP_CONFIG.DAMAGE_REDUCTION);
    
    // Aplicar defesa do defensor (simplificado)
    const defense = defender.level;
    const finalDamage = Math.max(1, pvpDamage - defense);
    
    return finalDamage;
  }

  /**
   * Calcula perda de XP ao morrer em PvP
   */
  static calculateXPLoss(player: Player): number {
    return Math.floor(player.experience * PVP_CONFIG.XP_LOSS_ON_DEATH);
  }

  /**
   * Verifica se um jogador está morto
   */
  static isDead(player: Player): boolean {
    return player.hp <= 0;
  }

  /**
   * Respawn do jogador após morte PvP
   */
  static respawnPlayer(player: Player): Player {
    return {
      ...player,
      hp: player.maxHp,
      mana: player.maxMana,
      position: { x: 10, y: 10 }, // Spawn point
      experience: Math.max(0, player.experience - this.calculateXPLoss(player)),
      pvpStatus: {
        flag: PvPFlag.NONE,
        flagExpiration: null,
        lastAttackTime: null,
        attackedBy: null,
        canAttack: true,
      },
    };
  }
}
