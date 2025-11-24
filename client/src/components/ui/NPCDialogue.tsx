import { useGame } from '@/contexts/GameContext';
import { Button } from './button';
import { X } from 'lucide-react';
import type { NPC } from '@/types/game';
import { QuestStatus } from '@/types/npc';

interface NPCDialogueProps {
  npc: NPC;
  onClose: () => void;
  onOpenShop: () => void;
  onAcceptQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
}

export default function NPCDialogue({ npc, onClose, onOpenShop, onAcceptQuest, onCompleteQuest }: NPCDialogueProps) {
  const { state } = useGame();
  
  // Check if there are any completed quests from this NPC
  const completableQuests = state.activeQuests.filter(quest => 
    quest.npcId === npc.id && quest.status === QuestStatus.COMPLETED
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card border-2 border-primary rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-primary font-mono">{npc.name}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Greeting */}
        <div className="bg-background border border-border rounded p-4 mb-4">
          <p className="text-sm text-foreground font-mono">{npc.dialogue.greeting}</p>
        </div>

        {/* Completable Quests */}
        {completableQuests.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-primary font-mono mb-2">✅ Quests to Complete:</h3>
            <div className="space-y-2">
              {completableQuests.map(quest => (
                <Button
                  key={quest.id}
                  variant="default"
                  className="w-full justify-start font-mono text-sm bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onCompleteQuest(quest.id);
                  }}
                >
                  🏆 Complete: {quest.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Options */}
        <div className="space-y-2">
          {npc.dialogue.options.map((option, index) => {
            // Verificar se a quest já foi aceita
            if (option.action === 'quest' && option.questId) {
              const questActive = state.activeQuests.some(q => q.id === option.questId);
              const questCompleted = state.completedQuests.includes(option.questId);
              
              if (questActive || questCompleted) {
                return null; // Não mostrar opção se quest já está ativa ou completa
              }
            }

            return (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start font-mono text-sm"
                onClick={() => {
                  if (option.action === 'shop') {
                    onOpenShop();
                  } else if (option.action === 'quest' && option.questId) {
                    onAcceptQuest(option.questId);
                  } else if (option.action === 'close') {
                    onClose();
                  }
                }}
              >
                {option.text}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
