import { useGame } from '@/contexts/GameContext';
import { useSkills } from '@/hooks/game/useSkills';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SkillHotbar() {
  const { state } = useGame();
  const { useSkill } = useSkills();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const unlockedSkills = state.skills.filter((s) => s.unlocked).slice(0, 9);

  // Hotkeys 1-9
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = parseInt(e.key);
      if (key >= 1 && key <= 9 && unlockedSkills[key - 1]) {
        const skill = unlockedSkills[key - 1];
        
        // Se a skill precisa de alvo, selecionar e esperar clique
        if (skill.targetType === 'single' || skill.targetType === 'area') {
          setSelectedSkill(skill.id);
          toast.info(`${skill.icon} ${skill.name} selecionada! Clique em um monstro.`);
        } else {
          // Skill self-target, usar imediatamente
          useSkill(skill.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [unlockedSkills, useSkill]);

  // Clicar em monstro para usar skill
  useEffect(() => {
    if (!selectedSkill) return;

    const handleMonsterClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const monsterCard = target.closest('[data-monster-id]');
      
      if (monsterCard) {
        const monsterId = monsterCard.getAttribute('data-monster-id');
        const monster = state.monsters.find((m) => m.id === monsterId);
        
        if (monster) {
          useSkill(selectedSkill, monster.position);
          setSelectedSkill(null);
        }
      }
    };

    document.addEventListener('click', handleMonsterClick);
    return () => document.removeEventListener('click', handleMonsterClick);
  }, [selectedSkill, state.monsters, useSkill]);

  if (unlockedSkills.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/80 p-2 rounded-lg border-2 border-yellow-600">
      {unlockedSkills.map((skill, index) => (
        <div
          key={skill.id}
          className={`relative w-12 h-12 flex items-center justify-center rounded border-2 cursor-pointer transition-all ${
            selectedSkill === skill.id
              ? 'border-yellow-400 bg-yellow-900/50 scale-110'
              : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
          }`}
          onClick={() => {
            if (skill.targetType === 'single' || skill.targetType === 'area') {
              setSelectedSkill(skill.id);
              toast.info(`${skill.icon} ${skill.name} selecionada! Clique em um monstro.`);
            } else {
              useSkill(skill.id);
            }
          }}
          title={`${skill.name} (${skill.manaCost} mana) - Hotkey: ${index + 1}`}
        >
          <span className="text-2xl">{skill.icon}</span>
          <span className="absolute bottom-0 right-0 text-xs font-bold text-white bg-black/70 px-1 rounded">
            {index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
