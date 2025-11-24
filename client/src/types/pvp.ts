export enum PvPFlag {
  NONE = 'NONE',           // Sem flag (branco)
  ATTACKER = 'ATTACKER',   // Atacou outro jogador (white skull)
  VICTIM = 'VICTIM',       // Foi atacado (yellow skull)
}

export interface PvPStatus {
  flag: PvPFlag;
  flagExpiration: number | null; // Timestamp quando a flag expira
  lastAttackTime: number | null; // Timestamp do último ataque
  attackedBy: number | null;     // ID do jogador que atacou
  canAttack: boolean;            // Se pode atacar (não está em cooldown)
}

export interface SafeZone {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export const PVP_CONFIG = {
  ATTACK_COOLDOWN: 5000,      // 5 segundos entre ataques PvP
  FLAG_DURATION: 300000,      // 5 minutos de flag após ataque
  DAMAGE_REDUCTION: 0.5,      // Dano PvP é 50% do dano PvE
  XP_LOSS_ON_DEATH: 0.1,      // Perde 10% de XP ao morrer em PvP
};
