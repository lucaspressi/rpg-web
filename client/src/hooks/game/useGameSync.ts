import { useEffect, useRef } from "react";
import { useGame } from "@/contexts/GameContext";
import { getItemById } from "@/data/items";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { FullGameState } from "@shared/gameTypes";

/**
 * Hook to synchronize game state with the database
 * - Loads progress when the game starts
 * - Auto-saves every 30 seconds
 */
export function useGameSync() {
  const { state, dispatch } = useGame();
  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  // Load game state from database
  const { data: loadedState, isLoading } = trpc.game.load.useQuery(undefined, {
    enabled: !hasLoadedRef.current,
    retry: false,
  });

  const saveMutation = trpc.game.save.useMutation({
    onSuccess: () => {
      console.log("Game progress saved successfully");
    },
    onError: (error) => {
      console.error("Failed to save game progress:", error);
      toast.error("Failed to save progress");
    },
  });

  // Load state into game context
  useEffect(() => {
    if (loadedState && !hasLoadedRef.current) {
      hasLoadedRef.current = true;

      // Update player stats
      dispatch({
        type: "UPDATE_PLAYER",
        player: {
          ...state.player,
          level: loadedState.progress.level,
          experience: loadedState.progress.experience,
          hp: loadedState.progress.hp,
          maxHp: loadedState.progress.maxHp,
          mana: loadedState.progress.mana,
          maxMana: loadedState.progress.maxMana,
          gold: loadedState.progress.gold,
          position: {
            x: loadedState.progress.positionX,
            y: loadedState.progress.positionY,
          },
        },
      });

      // Update skill points
      dispatch({
        type: "SET_SKILL_POINTS",
        skillPoints: loadedState.progress.skillPoints,
      });

      // Update inventory
      // Convert loaded inventory from IDs to Item objects
      const inventoryItems = loadedState.inventory
        .map((item) => {
          const itemData = getItemById(item.itemId);
          if (!itemData) return null;
          return {
            ...itemData,
            quantity: item.quantity,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      // Update equipment
      // Convert loaded equipment from IDs to Item objects
      const equipment = {
        helmet: loadedState.equipment.helmet ? getItemById(loadedState.equipment.helmet) : undefined,
        amulet: loadedState.equipment.amulet ? getItemById(loadedState.equipment.amulet) : undefined,
        backpack: loadedState.equipment.backpack ? getItemById(loadedState.equipment.backpack) : undefined,
        weapon: loadedState.equipment.weapon ? getItemById(loadedState.equipment.weapon) : undefined,
        armor: loadedState.equipment.armor ? getItemById(loadedState.equipment.armor) : undefined,
        shield: loadedState.equipment.shield ? getItemById(loadedState.equipment.shield) : undefined,
        ring: loadedState.equipment.ring ? getItemById(loadedState.equipment.ring) : undefined,
        legs: loadedState.equipment.legs ? getItemById(loadedState.equipment.legs) : undefined,
        arrows: loadedState.equipment.arrows ? getItemById(loadedState.equipment.arrows) : undefined,
        boots: loadedState.equipment.boots ? getItemById(loadedState.equipment.boots) : undefined,
      };

      dispatch({
        type: "UPDATE_PLAYER",
        player: {
          ...state.player,
          inventory: inventoryItems,
          equipment,
        },
      });

      // Update skills
      const unlockedSkills = loadedState.skills
        .filter((skill) => skill.unlocked)
        .map((skill) => skill.skillId);

      dispatch({
        type: "SET_UNLOCKED_SKILLS",
        skills: unlockedSkills,
      });

      toast.success("Progress loaded successfully!");
    }
  }, [loadedState, dispatch, state.player]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (hasLoadedRef.current && !isLoading) {
      // Start auto-save interval
      saveIntervalRef.current = setInterval(() => {
        saveGameState();
      }, 30000); // 30 seconds

      // Save on unmount
      return () => {
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
        }
        saveGameState();
      };
    }
  }, [state, hasLoadedRef.current, isLoading]);

  // Function to save game state
  const saveGameState = () => {
    if (!hasLoadedRef.current) return;

    const gameState: FullGameState = {
      progress: {
        level: state.player.level,
        experience: state.player.experience,
        hp: state.player.hp,
        maxHp: state.player.maxHp,
        mana: state.player.mana,
        maxMana: state.player.maxMana,
        gold: state.player.gold,
        positionX: state.player.position.x,
        positionY: state.player.position.y,
        skillPoints: state.skillPoints,
      },
      inventory: state.player.inventory.map((item: any) => ({
        itemId: item.id,
        quantity: item.quantity,
      })),
      equipment: {
        helmet: state.player.equipment.helmet?.id || null,
        amulet: state.player.equipment.amulet?.id || null,
        backpack: state.player.equipment.backpack?.id || null,
        weapon: state.player.equipment.weapon?.id || null,
        armor: state.player.equipment.armor?.id || null,
        shield: state.player.equipment.shield?.id || null,
        ring: state.player.equipment.ring?.id || null,
        legs: state.player.equipment.legs?.id || null,
        arrows: state.player.equipment.arrows?.id || null,
        boots: state.player.equipment.boots?.id || null,
      },
      skills: state.skills
        .filter((skill: any) => skill.unlocked)
        .map((skill: any) => ({
          skillId: skill.id,
          unlocked: true,
        })),
    };

    saveMutation.mutate(gameState);
  };

  return {
    isLoading,
    saveGameState,
  };
}
