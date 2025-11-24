import { useGame } from '@/contexts/GameContext';
import { Skill } from '@/types/skill';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock, Unlock, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface SkillTreeProps {
  onClose: () => void;
}

export default function SkillTree({ onClose }: SkillTreeProps) {
  const { state, dispatch } = useGame();
  const { skills, skillPoints, player } = state;

  const handleUnlockSkill = (skill: Skill) => {
    if (skill.unlocked) {
      toast.info(`${skill.name} já está desbloqueada!`);
      return;
    }

    if (player.level < skill.levelRequired) {
      toast.error(`Você precisa ser level ${skill.levelRequired} para desbloquear ${skill.name}!`);
      return;
    }

    if (skillPoints < 1) {
      toast.error('Você não tem Skill Points suficientes!');
      return;
    }

    dispatch({ type: 'UNLOCK_SKILL', skillId: skill.id });
    toast.success(`✨ ${skill.name} desbloqueada!`, {
      description: skill.description,
    });
  };

  const getSkillCardStyle = (skill: Skill) => {
    if (skill.unlocked) {
      return 'border-green-500 bg-green-950/30';
    }
    if (player.level >= skill.levelRequired) {
      return 'border-yellow-500 bg-yellow-950/20 hover:bg-yellow-950/30';
    }
    return 'border-gray-700 bg-gray-900/50 opacity-60';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-yellow-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-4 border-b-2 border-yellow-600 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Skill Tree
            </h2>
            <p className="text-sm text-gray-300 mt-1">
              Skill Points disponíveis: <span className="text-yellow-400 font-bold">{skillPoints}</span>
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-950/30 border-b border-blue-800">
          <p className="text-sm text-blue-200">
            💡 <strong>Dica:</strong> Você ganha 1 Skill Point a cada level. Use-os para desbloquear novas habilidades!
          </p>
        </div>

        {/* Skills Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Card
              key={skill.id}
              className={`p-4 transition-all cursor-pointer ${getSkillCardStyle(skill)}`}
              onClick={() => handleUnlockSkill(skill)}
            >
              {/* Icon e Nome */}
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl">{skill.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    {skill.name}
                    {skill.unlocked ? (
                      <Unlock className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-500" />
                    )}
                  </h3>
                  <p className="text-xs text-gray-400">{skill.type.toUpperCase()}</p>
                </div>
              </div>

              {/* Descrição */}
              <p className="text-sm text-gray-300 mb-3">{skill.description}</p>

              {/* Stats */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Level Required:</span>
                  <span className={player.level >= skill.levelRequired ? 'text-green-400' : 'text-red-400'}>
                    {skill.levelRequired}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mana Cost:</span>
                  <span className="text-blue-400">{skill.manaCost}</span>
                </div>
                {skill.damageRange && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Damage:</span>
                    <span className="text-red-400">
                      {skill.damageRange[0]}-{skill.damageRange[1]}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Range:</span>
                  <span className="text-purple-400">{skill.range} tiles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cooldown:</span>
                  <span className="text-orange-400">{skill.cooldown / 1000}s</span>
                </div>
              </div>

              {/* Status */}
              <div className="mt-3 pt-3 border-t border-gray-700">
                {skill.unlocked ? (
                  <p className="text-xs text-green-400 font-semibold">✓ DESBLOQUEADA</p>
                ) : player.level >= skill.levelRequired ? (
                  <p className="text-xs text-yellow-400 font-semibold">
                    ⚡ Clique para desbloquear (1 SP)
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    🔒 Requer Level {skill.levelRequired}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
