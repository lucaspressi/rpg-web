import { useGame } from '@/contexts/GameContext';
import { StatsSystem } from '@/systems/StatsSystem';
import { useState, useEffect, useRef } from 'react';

export default function StatusPanel() {
  const { state } = useGame();
  const { player } = state;
  const [animateAttack, setAnimateAttack] = useState(false);
  const [animateDefense, setAnimateDefense] = useState(false);
  const prevAttackRef = useRef(0);
  const prevDefenseRef = useRef(0);

  const hpPercent = (player.hp / player.maxHp) * 100;
  const manaPercent = (player.mana / player.maxMana) * 100;
  const expToLevel = player.level * 100;
  const expPercent = (player.experience / expToLevel) * 100;

  const stats = {
    attack: player.level * 8 + StatsSystem.calculateAttackBonus(player.equipment),
    defense: StatsSystem.calculateTotalDefense(player),
  };

  // Detectar mudanças nos stats e animar
  useEffect(() => {
    if (stats.attack > prevAttackRef.current && prevAttackRef.current > 0) {
      setAnimateAttack(true);
      setTimeout(() => setAnimateAttack(false), 500);
    }
    prevAttackRef.current = stats.attack;
  }, [stats.attack]);

  useEffect(() => {
    if (stats.defense > prevDefenseRef.current && prevDefenseRef.current > 0) {
      setAnimateDefense(true);
      setTimeout(() => setAnimateDefense(false), 500);
    }
    prevDefenseRef.current = stats.defense;
  }, [stats.defense]);

  return (
    <div className="game-panel p-4 space-y-3">
      <div className="text-center">
        <h2 className="pixel-font text-sm text-primary mb-2">{player.name}</h2>
        <div className="text-xs retro-font text-muted-foreground">
          Level {player.level}
        </div>
      </div>

      <div className="space-y-2">
        {/* HP Bar */}
        <div>
          <div className="flex justify-between text-xs retro-font mb-1">
            <span className="text-foreground">HP</span>
            <span className="text-muted-foreground">
              {player.hp} / {player.maxHp}
            </span>
          </div>
          <div className="hp-bar h-4 rounded">
            <div
              className="hp-bar-fill h-full rounded"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* Mana Bar */}
        <div>
          <div className="flex justify-between text-xs retro-font mb-1">
            <span className="text-foreground">Mana</span>
            <span className="text-muted-foreground">
              {player.mana} / {player.maxMana}
            </span>
          </div>
          <div className="mana-bar h-4 rounded">
            <div
              className="mana-bar-fill h-full rounded"
              style={{ width: `${manaPercent}%` }}
            />
          </div>
        </div>

        {/* Experience Bar */}
        <div>
          <div className="flex justify-between text-xs retro-font mb-1">
            <span className="text-foreground">EXP</span>
            <span className="text-muted-foreground">
              {player.experience} / {expToLevel}
            </span>
          </div>
          <div className="hp-bar h-3 rounded">
            <div
              className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded transition-all"
              style={{ width: `${expPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border space-y-1 text-xs retro-font">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gold:</span>
          <span className="text-accent font-bold">{player.gold}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Position:</span>
          <span className="text-foreground">
            {player.position.x}, {player.position.y}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border space-y-1 text-xs retro-font">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <span>⚔️</span> Attack:
          </span>
          <span className={`text-red-400 font-bold ${animateAttack ? 'stat-increased' : ''}`}>
            {stats.attack}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <span>🛡️</span> Defense:
          </span>
          <span className={`text-blue-400 font-bold ${animateDefense ? 'stat-increased' : ''}`}>
            {stats.defense}
          </span>
        </div>
      </div>
    </div>
  );
}
