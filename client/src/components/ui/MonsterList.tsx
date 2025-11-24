import { useGame } from '@/contexts/GameContext';
import { useAutoAttack } from '@/hooks/game/useAutoAttack';
import { MovementSystem } from '@/systems/MovementSystem';

export default function MonsterList() {
  const { state } = useGame();
  const { setTarget } = useAutoAttack();

  const monstersWithDistance = state.monsters.map((monster) => ({
    ...monster,
    distance: MovementSystem.getDistance(state.player.position, monster.position),
  }));

  const sortedMonsters = monstersWithDistance.sort((a, b) => a.distance - b.distance);

  return (
    <div className="game-panel p-4">
      <h3 className="pixel-font text-xs text-primary mb-3">Nearby Creatures</h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedMonsters.length === 0 ? (
          <div className="text-xs retro-font text-muted-foreground text-center py-4">
            No creatures nearby
          </div>
        ) : (
          sortedMonsters.map((monster) => {
            const hpPercent = (monster.hp / monster.maxHp) * 100;
            const isInRange = monster.distance <= 1;
            const isTarget = state.targetId === monster.id;

            return (
              <div
                key={monster.id}
                data-monster-id={monster.id}
                className={`border rounded p-2 transition-colors cursor-pointer ${
                  isTarget
                    ? 'border-primary bg-primary/20 hover:bg-primary/30 ring-2 ring-primary'
                    : isInRange
                    ? 'border-accent bg-accent/10 hover:bg-accent/20'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
                onClick={() => setTarget(isTarget ? null : monster.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="text-xs retro-font text-foreground font-bold">
                      {monster.name}
                    </div>
                    <div className={`text-xs retro-font ${isInRange ? 'text-accent font-bold' : 'text-muted-foreground'}`}>
                      Level {monster.level} • {monster.distance} tiles away
                      {isInRange && ' ⚔️ IN RANGE'}
                    </div>
                  </div>
                  {isInRange && (
                    <span className="text-xs pixel-font text-accent animate-pulse">⚔️</span>
                  )}
                </div>
                
                <div className="hp-bar h-2 rounded mt-1">
                  <div
                    className="hp-bar-fill h-full rounded"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                
                <div className="text-xs retro-font text-muted-foreground mt-1">
                  {monster.hp} / {monster.maxHp} HP
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-border text-xs retro-font text-muted-foreground">
        Click on a creature to attack (must be within 1 tile)
      </div>
    </div>
  );
}
