export interface DamageText {
  id: string;
  damage: number;
  position: { x: number; y: number };
  timestamp: number;
  type: 'player' | 'monster';
}
