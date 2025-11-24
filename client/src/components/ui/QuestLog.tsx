import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { X, Trophy, Coins, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { QuestStatus } from '@/types/npc';

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuestLog({ isOpen, onClose }: QuestLogProps) {
  const { state, dispatch } = useGame();
  const { activeQuests } = state;

  const handleCompleteQuest = (questId: string) => {
    const quest = activeQuests.find(q => q.id === questId);
    if (!quest || quest.status !== QuestStatus.COMPLETED) {
      toast.error('Quest objectives not completed yet!');
      return;
    }

    dispatch({ type: 'COMPLETE_QUEST', questId });
    toast.success(`Quest completed: ${quest.name}!`, {
      description: `Received ${quest.rewards.xp} XP and ${quest.rewards.gold} gold`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border-4 border-primary rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b-2 border-primary/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="pixel-font text-xl text-primary">Quest Log</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-destructive/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeQuests.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="retro-font text-muted-foreground">No active quests</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Talk to NPCs with ! icon to start quests
              </p>
            </div>
          ) : (
            activeQuests.map((quest) => {
              const allObjectivesComplete = quest.objectives.every(
                (obj) => obj.current >= obj.required
              );

              return (
                <div
                  key={quest.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    allObjectivesComplete
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  {/* Quest Title */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="pixel-font text-lg text-foreground mb-1">
                        {quest.name}
                      </h3>
                      <p className="text-sm text-muted-foreground retro-font">
                        {quest.description}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Quest Giver: {quest.npcId}
                      </p>
                    </div>
                    {allObjectivesComplete && (
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-xs pixel-font">
                        ✓ READY
                      </div>
                    )}
                  </div>

                  {/* Objectives */}
                  <div className="space-y-2 mb-3">
                    {quest.objectives.map((objective, index) => {
                      const progress = (objective.current / objective.required) * 100;
                      const isComplete = objective.current >= objective.required;

                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={`retro-font ${isComplete ? 'text-green-500' : 'text-foreground'}`}>
                              {isComplete ? '✓' : '○'} {objective.type === 'kill' ? 'Kill' : 'Collect'} {objective.required} {objective.target}
                            </span>
                            <span className={`text-xs ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>
                              {objective.current}/{objective.required}
                            </span>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isComplete ? 'bg-green-500' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Rewards */}
                  <div className="border-t border-border pt-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-2 pixel-font">Rewards:</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-blue-500" />
                        <span className="retro-font text-foreground">{quest.rewards.xp} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-yellow-500" />
                        <span className="retro-font text-foreground">{quest.rewards.gold} Gold</span>
                      </div>
                      {quest.rewards.items.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Gift className="w-4 h-4 text-purple-500" />
                          <span className="retro-font text-foreground">
                            {quest.rewards.items.length} item(s)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Complete Button */}
                  {allObjectivesComplete && (
                    <Button
                      onClick={() => handleCompleteQuest(quest.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white pixel-font"
                    >
                      🏆 Complete Quest
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-primary/30 p-3 bg-muted/30">
          <p className="text-xs text-center text-muted-foreground retro-font">
            Press <kbd className="px-2 py-1 bg-background border border-border rounded">Q</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
}
