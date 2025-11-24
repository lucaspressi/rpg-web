import { Player, Equipment } from '@/types/game';

/**
 * Sistema para calcular stats totais do jogador baseado em equipamentos
 */
export class StatsSystem {
  /**
   * Calcula o bônus de ataque total dos equipamentos
   */
  static calculateAttackBonus(equipment: Equipment): number {
    let attackBonus = 0;

    // Arma
    if (equipment.weapon?.attack) {
      attackBonus += equipment.weapon.attack;
    }

    return attackBonus;
  }

  /**
   * Calcula o bônus de defesa total dos equipamentos
   */
  static calculateDefenseBonus(equipment: Equipment): number {
    let defenseBonus = 0;

    // Armadura
    if (equipment.armor?.defense) {
      defenseBonus += equipment.armor.defense;
    }

    // Escudo
    if (equipment.shield?.defense) {
      defenseBonus += equipment.shield.defense;
    }

    // Capacete
    if (equipment.helmet?.defense) {
      defenseBonus += equipment.helmet.defense;
    }

    // Botas
    if (equipment.boots?.defense) {
      defenseBonus += equipment.boots.defense;
    }

    // Pernas
    if (equipment.legs?.defense) {
      defenseBonus += equipment.legs.defense;
    }

    // Anel
    if (equipment.ring?.defense) {
      defenseBonus += equipment.ring.defense;
    }

    // Amuleto
    if (equipment.amulet?.defense) {
      defenseBonus += equipment.amulet.defense;
    }

    return defenseBonus;
  }

  /**
   * Calcula o bônus de velocidade total dos equipamentos
   */
  static calculateSpeedBonus(equipment: Equipment): number {
    let speedBonus = 0;

    // Botas
    if (equipment.boots?.speed) {
      speedBonus += equipment.boots.speed;
    }

    return speedBonus;
  }

  /**
   * Calcula o dano total do jogador (level base + equipamentos)
   */
  static calculateTotalDamage(player: Player): number {
    const baseDamage = player.level * 8; // Dano base por level
    const attackBonus = this.calculateAttackBonus(player.equipment);
    const totalDamage = baseDamage + attackBonus;

    // Adiciona variação aleatória (±20%)
    const variation = Math.floor(totalDamage * 0.2);
    const minDamage = totalDamage - variation;
    const maxDamage = totalDamage + variation;

    return Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
  }

  /**
   * Calcula a defesa total do jogador (equipamentos)
   */
  static calculateTotalDefense(player: Player): number {
    return this.calculateDefenseBonus(player.equipment);
  }

  /**
   * Calcula o dano recebido considerando defesa
   */
  static calculateDamageReceived(baseDamage: number, defense: number): number {
    // Cada ponto de defesa reduz 5% do dano (máximo 80% de redução)
    const damageReduction = Math.min(defense * 0.05, 0.8);
    const damageReceived = Math.floor(baseDamage * (1 - damageReduction));
    
    return Math.max(1, damageReceived); // Mínimo 1 de dano
  }
}
