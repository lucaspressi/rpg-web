import { GameProvider } from '@/contexts/GameContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

import { useGameSync } from '@/hooks/game/useGameSync';
import { useGameControls } from '@/hooks/game/useGameControls';
import { useGameLoop } from '@/hooks/game/useGameLoop';
import { useAutoAttack } from '@/hooks/game/useAutoAttack';
import { useDamageTexts } from '@/hooks/game/useDamageTexts';
import { useMonsterRespawn } from '@/hooks/game/useMonsterRespawn';
import { useMultiplayer } from '@/hooks/game/useMultiplayer';
import { usePvP } from '@/hooks/game/usePvP';
import { useNPCInteraction } from '@/hooks/game/useNPCInteraction';
import { usePlayerDeath } from '@/hooks/game/usePlayerDeath';
import GameCanvas from '@/components/GameCanvas';
import StatusPanel from '@/components/ui/StatusPanel';
import MessageLog from '@/components/ui/MessageLog';
import InventoryPanel from '@/components/ui/InventoryPanel';
import MonsterList from '@/components/ui/MonsterList';
import Minimap from '@/components/ui/Minimap';
import GameControls from '@/components/ui/GameControls';
import SkillHotbar from '@/components/ui/SkillHotbar';
import OnlinePlayersList from '@/components/ui/OnlinePlayersList';
import NPCDialogue from '@/components/ui/NPCDialogue';
import ShopUI from '@/components/ui/ShopUI';
import QuestLog from '@/components/ui/QuestLog';
import DeathScreen from '@/components/ui/DeathScreen';
import { useState, useEffect } from 'react';

function GameContent() {
  const { isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, loading, setLocation]);

  // Sync game state with database
  useGameSync();
  
  // Connect to multiplayer
  const { socket, onlinePlayers } = useMultiplayer();
  
  // PvP system
  const { attackPlayer, canAttack } = usePvP(socket);
  
  // NPC interaction
  const { activeNPC, showShop, closeDialogue, openShop, acceptQuest, completeQuest } = useNPCInteraction();
  
  // Quest Log state
  const [showQuestLog, setShowQuestLog] = useState(false);
  
  // Toggle Quest Log with Q key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'q' && !activeNPC) {
        setShowQuestLog(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeNPC]);
  
  useGameControls();
  useGameLoop();
  useAutoAttack();
  useDamageTexts();
  useMonsterRespawn();
  usePlayerDeath();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-blue-400 text-xl font-mono">Loading game...</div>
      </div>
    );
  }

  // Don't render game until authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-4 text-center">
          <h1 className="pixel-font text-2xl text-primary mb-2">
            Tibia Web Edition
          </h1>
          <p className="retro-font text-sm text-muted-foreground">
            Use WASD or Arrow Keys to move • Click monsters to attack • Press E near NPCs to interact • Press Q for Quest Log
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-4">
            <StatusPanel />
            <GameControls />
            <MessageLog />
          </div>

          {/* Center - Game Canvas */}
          <div className="lg:col-span-6 flex justify-center items-start">
            <GameCanvas />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3 space-y-4">
            <Minimap />
            <OnlinePlayersList 
              players={onlinePlayers}
              onAttackPlayer={attackPlayer}
              canAttack={canAttack}
            />
            <MonsterList />
            <InventoryPanel />
          </div>
        </div>

        <SkillHotbar />

        {/* NPC Dialogue */}
        {activeNPC && !showShop && (
          <NPCDialogue
            npc={activeNPC}
            onClose={closeDialogue}
            onOpenShop={openShop}
            onAcceptQuest={acceptQuest}
            onCompleteQuest={completeQuest}
          />
        )}

        {/* Shop UI */}
        {activeNPC && showShop && (
          <ShopUI
            npc={activeNPC}
            onClose={closeDialogue}
          />
        )}

        {/* Quest Log */}
        <QuestLog
          isOpen={showQuestLog}
          onClose={() => setShowQuestLog(false)}
        />

        {/* Death Screen */}
        <DeathScreen />

        <footer className="mt-6 text-center">
          <div className="game-panel inline-block px-6 py-3">
            <p className="retro-font text-xs text-muted-foreground">
              A tribute to the classic MMORPG Tibia
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Game() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
