import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import SkillTree from './SkillTree';

export default function GameControls() {
  const { state, dispatch } = useGame();
  const [showSkillTree, setShowSkillTree] = useState(false);

  const handlePause = () => {
    dispatch({ type: 'TOGGLE_PAUSE' });
  };

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <>
      <div className="game-panel p-3 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            className="pixel-font text-xs"
          >
            {state.isPaused ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRestart}
            className="pixel-font text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restart
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSkillTree(true)}
            className="pixel-font text-xs gap-1"
          >
            <Sparkles className="w-3 h-3" />
            Skills ({state.skillPoints})
          </Button>
        </div>
        
        {state.isPaused && (
          <div className="pixel-font text-xs text-accent animate-pulse">
            PAUSED
          </div>
        )}
      </div>
      
      {showSkillTree && <SkillTree onClose={() => setShowSkillTree(false)} />}
    </>
  );
}
