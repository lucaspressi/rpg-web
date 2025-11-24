import { Swords, Shield, Skull } from 'lucide-react';
import type { OnlinePlayer } from '@/types/multiplayer';
import { PvPFlag } from '@/types/pvp';
import { Button } from './button';

interface OnlinePlayersListProps {
  players: OnlinePlayer[];
  onAttackPlayer: (playerId: number) => void;
  canAttack: boolean;
}

export default function OnlinePlayersList({ players, onAttackPlayer, canAttack }: OnlinePlayersListProps) {
  if (players.length === 0) {
    return (
      <div className="bg-card border border-border rounded p-3">
        <h3 className="text-sm font-bold text-primary mb-2 font-mono flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Online Players (0)
        </h3>
        <p className="text-xs text-muted-foreground font-mono">No other players online</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded p-3">
      <h3 className="text-sm font-bold text-primary mb-2 font-mono flex items-center gap-2">
        <Shield className="w-4 h-4" />
        Online Players ({players.length})
      </h3>
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {players.map((player) => (
          <div
            key={player.playerId}
            className="bg-background border border-border rounded p-2 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 font-mono">
                  {player.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Lv {player.level}
                </span>
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(player.hp / player.maxHp) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {player.hp}/{player.maxHp} HP
                </span>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onAttackPlayer(player.playerId)}
              disabled={!canAttack}
              className="ml-2"
            >
              <Swords className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
