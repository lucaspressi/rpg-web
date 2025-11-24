import { describe, it, expect } from 'vitest';
import { SkillSystem } from '../SkillSystem';
import { INITIAL_SKILLS } from '@/data/skills';
import { Player } from '@/types/game';

describe('SkillSystem', () => {
  const mockPlayer: Player = {
    id: 'player',
    name: 'Hero',
    level: 5,
    hp: 100,
    maxHp: 100,
    mana: 50,
    maxMana: 50,
    experience: 0,
    position: { x: 10, y: 10 },
    direction: 0,
    inventory: [],
    equipment: {
      helmet: null,
      amulet: null,
      backpack: null,
      weapon: null,
      armor: null,
      shield: null,
      ring: null,
      legs: null,
      arrows: null,
      boots: null,
    },
  };

  const getFireball = () => INITIAL_SKILLS.find(s => s.id === 'FIREBALL')!;

  describe('canUseSkill', () => {
    it('should allow using unlocked skill with enough mana', () => {
      const fireball = { ...getFireball(), unlocked: true };
      const result = SkillSystem.canUseSkill(fireball, mockPlayer, 0);
      
      expect(result.canUse).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should not allow using locked skill', () => {
      const fireball = { ...getFireball(), unlocked: false };
      const result = SkillSystem.canUseSkill(fireball, mockPlayer, 0);
      
      expect(result.canUse).toBe(false);
      expect(result.reason).toBe('Skill não desbloqueada');
    });

    it('should not allow using skill without enough mana', () => {
      const fireball = { ...getFireball(), unlocked: true };
      const lowManaPlayer = { ...mockPlayer, mana: 5 };
      const result = SkillSystem.canUseSkill(fireball, lowManaPlayer, 0);
      
      expect(result.canUse).toBe(false);
      expect(result.reason).toBe('Mana insuficiente');
    });

    it('should not allow using skill on cooldown', () => {
      const fireball = { ...getFireball(), unlocked: true };
      const recentUse = Date.now() - 500; // 500ms ago, cooldown is 2000ms
      const result = SkillSystem.canUseSkill(fireball, mockPlayer, recentUse);
      
      expect(result.canUse).toBe(false);
      expect(result.reason).toContain('Cooldown');
    });
  });

  describe('useSkill', () => {
    it('should reduce player mana when using skill', () => {
      const fireball = getFireball();
      const updatedPlayer = SkillSystem.useSkill(fireball, mockPlayer);
      
      expect(updatedPlayer.mana).toBe(mockPlayer.mana - fireball.manaCost);
      expect(updatedPlayer.mana).toBe(40); // 50 - 10
    });

    it('should not modify other player properties', () => {
      const fireball = getFireball();
      const updatedPlayer = SkillSystem.useSkill(fireball, mockPlayer);
      
      expect(updatedPlayer.hp).toBe(mockPlayer.hp);
      expect(updatedPlayer.level).toBe(mockPlayer.level);
      expect(updatedPlayer.position).toEqual(mockPlayer.position);
    });
  });

  describe('createProjectile', () => {
    it('should create projectile with correct properties', () => {
      const fireball = getFireball();
      const startPos = { x: 10, y: 10 };
      const targetPos = { x: 15, y: 15 };
      
      const projectile = SkillSystem.createProjectile(fireball, startPos, targetPos);
      
      expect(projectile.skillId).toBe(fireball.id);
      expect(projectile.position).toEqual(startPos);
      expect(projectile.targetPosition).toEqual(targetPos);
      expect(projectile.speed).toBe(0.3);
      expect(projectile.sprite).toBe(fireball.icon);
    });

    it('should generate damage within skill range', () => {
      const fireball = getFireball();
      const startPos = { x: 10, y: 10 };
      const targetPos = { x: 15, y: 15 };
      
      const projectile = SkillSystem.createProjectile(fireball, startPos, targetPos);
      
      expect(projectile.damage).toBeGreaterThanOrEqual(fireball.damageRange![0]);
      expect(projectile.damage).toBeLessThanOrEqual(fireball.damageRange![1]);
    });
  });

  describe('getDistance', () => {
    it('should calculate distance correctly', () => {
      const pos1 = { x: 0, y: 0 };
      const pos2 = { x: 3, y: 4 };
      
      const distance = SkillSystem.getDistance(pos1, pos2);
      
      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same position', () => {
      const pos = { x: 10, y: 10 };
      
      const distance = SkillSystem.getDistance(pos, pos);
      
      expect(distance).toBe(0);
    });
  });

  describe('isInRange', () => {
    it('should return true when target is within range', () => {
      const fireball = getFireball(); // range: 5
      const playerPos = { x: 10, y: 10 };
      const targetPos = { x: 13, y: 14 }; // distance: 5
      
      const inRange = SkillSystem.isInRange(playerPos, targetPos, fireball);
      
      expect(inRange).toBe(true);
    });

    it('should return false when target is out of range', () => {
      const fireball = getFireball(); // range: 5
      const playerPos = { x: 10, y: 10 };
      const targetPos = { x: 20, y: 20 }; // distance: ~14
      
      const inRange = SkillSystem.isInRange(playerPos, targetPos, fireball);
      
      expect(inRange).toBe(false);
    });
  });

  describe('updateProjectiles', () => {
    it('should move projectile towards target', () => {
      const projectile = {
        id: 'proj1',
        skillId: 'FIREBALL',
        position: { x: 10, y: 10 },
        targetPosition: { x: 15, y: 10 },
        speed: 0.5,
        damage: 25,
        sprite: '🔥',
        createdAt: Date.now(),
      };

      const { projectiles } = SkillSystem.updateProjectiles([projectile], []);

      expect(projectiles.length).toBe(1);
      expect(projectiles[0].position.x).toBeGreaterThan(10);
      expect(projectiles[0].position.x).toBeLessThan(15);
    });

    it('should remove projectile when it reaches target', () => {
      const projectile = {
        id: 'proj1',
        skillId: 'FIREBALL',
        position: { x: 14.9, y: 10 },
        targetPosition: { x: 15, y: 10 },
        speed: 0.5,
        damage: 25,
        sprite: '🔥',
        createdAt: Date.now(),
      };

      const { projectiles } = SkillSystem.updateProjectiles([projectile], []);

      expect(projectiles.length).toBe(0);
    });
  });
});
