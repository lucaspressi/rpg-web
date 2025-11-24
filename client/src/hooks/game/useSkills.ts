import { useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { SkillSystem } from '@/systems/SkillSystem';
import { toast } from 'sonner';

export function useSkills() {
  const { state, dispatch } = useGame();
  const lastUsedRef = useRef<Record<string, number>>({});

  // Atualizar projéteis
  useEffect(() => {
    if (state.isPaused || state.projectiles.length === 0) return;

    const interval = setInterval(() => {
      const { projectiles, hits } = SkillSystem.updateProjectiles(
        state.projectiles,
        state.monsters
      );

      // Atualizar projéteis
      dispatch({ type: 'UPDATE_PROJECTILES', projectiles });

      // Aplicar dano aos monstros atingidos
      if (hits.length > 0) {
        const updatedMonsters = state.monsters.map((monster) => {
          const hit = hits.find((h) => h.monsterId === monster.id);
          if (hit) {
            const newHp = Math.max(0, monster.hp - hit.damage);
            
            // Adicionar damage text
            dispatch({
              type: 'ADD_DAMAGE_TEXT',
              damage: hit.damage,
              position: monster.position,
              damageType: 'player',
            });

            // Se morreu, remover e adicionar à fila de respawn
            if (newHp <= 0) {
              dispatch({
                type: 'ADD_MESSAGE',
                message: `${monster.name} has been defeated!`,
                messageType: 'combat',
              });

              // Coletar loot e XP (simplificado)
              dispatch({
                type: 'ADD_MESSAGE',
                message: `You received ${monster.experience} XP!`,
                messageType: 'loot',
              });

              const respawnDelay = 30000 + Math.random() * 30000;
              dispatch({
                type: 'QUEUE_RESPAWN',
                monster,
                respawnTime: Date.now() + respawnDelay,
              });
              dispatch({ type: 'REMOVE_MONSTER', monsterId: monster.id });
              return null;
            }

            return { ...monster, hp: newHp };
          }
          return monster;
        }).filter((m): m is NonNullable<typeof m> => m !== null);

        dispatch({ type: 'UPDATE_MONSTERS', monsters: updatedMonsters });
      }
    }, 50); // 20 FPS para projéteis

    return () => clearInterval(interval);
  }, [state.projectiles, state.monsters, state.isPaused, dispatch]);

  // Função para usar skill
  const useSkill = (skillId: string, targetPosition?: { x: number; y: number }) => {
    const skill = state.skills.find((s) => s.id === skillId);
    if (!skill) {
      toast.error('Skill não encontrada!');
      return;
    }

    const lastUsed = lastUsedRef.current[skillId] || 0;
    const { canUse, reason } = SkillSystem.canUseSkill(skill, state.player, lastUsed);

    if (!canUse) {
      toast.error(reason || 'Não é possível usar esta skill');
      return;
    }

    // Verificar alcance se tiver alvo
    if (targetPosition) {
      if (!SkillSystem.isInRange(state.player.position, targetPosition, skill)) {
        toast.error(`Alvo fora de alcance! (Máx: ${skill.range} tiles)`);
        return;
      }
    }

    // Usar skill
    const updatedPlayer = SkillSystem.useSkill(skill, state.player);
    dispatch({ type: 'UPDATE_PLAYER', player: updatedPlayer });

    // Atualizar último uso
    lastUsedRef.current[skillId] = Date.now();

    // Criar projétil se for skill de ataque
    if (skill.damageRange && targetPosition) {
      const projectile = SkillSystem.createProjectile(
        skill,
        state.player.position,
        targetPosition
      );
      dispatch({
        type: 'UPDATE_PROJECTILES',
        projectiles: [...state.projectiles, projectile],
      });

      toast.success(`${skill.icon} ${skill.name}!`, {
        description: `Mana: ${updatedPlayer.mana}/${updatedPlayer.maxMana}`,
      });
    }

    // Skill de cura (self-target)
    if (skill.id === 'HEAL') {
      const healAmount = Math.floor(
        Math.random() * (Math.abs(skill.damageRange![1]) - Math.abs(skill.damageRange![0]) + 1) +
          Math.abs(skill.damageRange![0])
      );
      const newHp = Math.min(state.player.maxHp, state.player.hp + healAmount);
      
      dispatch({
        type: 'UPDATE_PLAYER',
        player: { ...updatedPlayer, hp: newHp },
      });

      dispatch({
        type: 'ADD_DAMAGE_TEXT',
        damage: -healAmount,
        position: state.player.position,
        damageType: 'player',
      });

      toast.success(`💚 Healed ${healAmount} HP!`);
    }
  };

  return { useSkill };
}
