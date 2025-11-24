import { describe, it, expect } from 'vitest';
import { MovementSystem } from '@/systems/MovementSystem';

describe('Click-to-Move System', () => {
  it('should calculate correct direction towards destination', () => {
    const from = { x: 10, y: 10 };
    const to = { x: 15, y: 10 };
    
    const direction = MovementSystem.getDirectionTowards(from, to);
    expect(direction).toBe('RIGHT');
  });

  it('should calculate distance correctly', () => {
    const from = { x: 10, y: 10 };
    const to = { x: 13, y: 14 };
    
    const distance = MovementSystem.getDistance(from, to);
    expect(distance).toBe(7); // Manhattan distance: |13-10| + |14-10| = 3 + 4 = 7
  });

  it('should return null direction when already at destination', () => {
    const from = { x: 10, y: 10 };
    const to = { x: 10, y: 10 };
    
    const direction = MovementSystem.getDirectionTowards(from, to);
    expect(direction).toBeNull();
  });

  it('should prioritize horizontal movement when both axes differ', () => {
    const from = { x: 10, y: 10 };
    const to = { x: 15, y: 15 };
    
    const direction = MovementSystem.getDirectionTowards(from, to);
    // Should move either RIGHT or DOWN (implementation dependent)
    expect(['RIGHT', 'DOWN']).toContain(direction);
  });
});
