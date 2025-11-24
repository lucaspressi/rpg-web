import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Skull, Trophy, Coins, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DeathScreen() {
  const { state, dispatch } = useGame();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!state.isDead) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRespawn();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [state.isDead]);

  const handleRespawn = () => {
    dispatch({ type: 'RESPAWN_PLAYER' });
    setCountdown(5); // Reset for next death
  };

  if (!state.isDead) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-background border-4 border-destructive rounded-lg shadow-2xl max-w-md w-full p-6 text-center">
        {/* Death Icon */}
        <div className="mb-6">
          <Skull className="w-24 h-24 text-destructive mx-auto animate-pulse" />
        </div>

        {/* Title */}
        <h1 className="pixel-font text-3xl text-destructive mb-2">YOU DIED</h1>
        <p className="retro-font text-muted-foreground mb-6">
          Your journey has come to a temporary end...
        </p>

        {/* Statistics */}
        <div className="bg-muted/30 border-2 border-border rounded-lg p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="retro-font text-sm text-muted-foreground flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Level
            </span>
            <span className="pixel-font text-foreground">{state.player.level}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="retro-font text-sm text-muted-foreground flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Gold Lost
            </span>
            <span className="pixel-font text-foreground">0</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="retro-font text-sm text-destructive flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              XP Lost (10%)
            </span>
            <span className="pixel-font text-destructive">
              {Math.floor(state.player.experience * 0.1)}
            </span>
          </div>
        </div>

        {/* Respawn Info */}
        <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-4 mb-6">
          <p className="retro-font text-sm text-foreground mb-2">
            <Heart className="w-4 h-4 inline mr-1" />
            You will respawn at the spawn point
          </p>
          <p className="text-xs text-muted-foreground">
            ✨ 5 seconds of invulnerability after respawn
          </p>
        </div>

        {/* Countdown */}
        <div className="mb-4">
          <p className="retro-font text-sm text-muted-foreground mb-2">
            Respawning in:
          </p>
          <div className="text-5xl pixel-font text-primary animate-pulse">
            {countdown}
          </div>
        </div>

        {/* Respawn Button */}
        <Button
          onClick={handleRespawn}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground pixel-font text-lg"
        >
          Respawn Now
        </Button>

        <p className="text-xs text-muted-foreground mt-4 retro-font">
          Death is not the end, brave adventurer!
        </p>
      </div>
    </div>
  );
}
