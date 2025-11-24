import type { SafeZone } from '@/types/pvp';

// Definir zonas seguras no mapa onde PvP não é permitido
export const SAFE_ZONES: SafeZone[] = [
  {
    name: 'Spawn Area',
    x: 8,
    y: 8,
    width: 5,
    height: 5,
  },
  // Adicionar mais zonas seguras conforme necessário
];

/**
 * Verifica se uma posição está dentro de uma zona segura
 */
export function isInSafeZone(x: number, y: number): boolean {
  return SAFE_ZONES.some(zone => {
    return (
      x >= zone.x &&
      x < zone.x + zone.width &&
      y >= zone.y &&
      y < zone.y + zone.height
    );
  });
}

/**
 * Retorna a zona segura em que o jogador está, ou null
 */
export function getSafeZone(x: number, y: number): SafeZone | null {
  return SAFE_ZONES.find(zone => {
    return (
      x >= zone.x &&
      x < zone.x + zone.width &&
      y >= zone.y &&
      y < zone.y + zone.height
    );
  }) || null;
}
