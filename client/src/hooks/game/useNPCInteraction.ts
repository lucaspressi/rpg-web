import { useEffect, useState, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import type { NPC } from '@/types/game';

export function useNPCInteraction() {
  const { state, dispatch } = useGame();
  const [showShop, setShowShop] = useState(false);
  const [activeNPC, setActiveNPC] = useState<NPC | null>(null);

  // Atualizar activeNPC quando state.activeNPC mudar
  useEffect(() => {
    if (state.activeNPC) {
      const npc = state.npcs.find(n => n.id === state.activeNPC);
      setActiveNPC(npc || null);
    } else {
      setActiveNPC(null);
      setShowShop(false);
    }
  }, [state.activeNPC, state.npcs]);

  // Verificar se está próximo de um NPC (tecla E para interagir)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        // Procurar NPC próximo (1 tile de distância)
        const nearbyNPC = state.npcs.find(npc => {
          const dx = Math.abs(npc.position.x - state.player.position.x);
          const dy = Math.abs(npc.position.y - state.player.position.y);
          return dx <= 1 && dy <= 1;
        });

        if (nearbyNPC) {
          dispatch({ type: 'INTERACT_NPC', npcId: nearbyNPC.id });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.npcs, state.player.position, dispatch]);

  const closeDialogue = useCallback(() => {
    dispatch({ type: 'CLOSE_NPC_DIALOGUE' });
    setShowShop(false);
  }, [dispatch]);

  const openShop = useCallback(() => {
    setShowShop(true);
  }, []);

  const acceptQuest = useCallback((questId: string) => {
    dispatch({ type: 'ACCEPT_QUEST', questId });
    closeDialogue();
  }, [dispatch, closeDialogue]);

  const completeQuest = useCallback((questId: string) => {
    dispatch({ type: 'COMPLETE_QUEST', questId });
    closeDialogue();
  }, [dispatch, closeDialogue]);

  return {
    activeNPC,
    showShop,
    closeDialogue,
    openShop,
    acceptQuest,
    completeQuest,
  };
}
