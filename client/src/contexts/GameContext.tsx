import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GameState, Player, Monster, NPC, Direction, ItemType, Equipment } from '@/types/game';
import type { OnlinePlayer } from '@/types/multiplayer';
import { PvPFlag } from '@/types/pvp';
import { QuestStatus } from '@/types/npc';
import { PvPSystem } from '@/systems/PvPSystem';
import { MapSystem } from '@/systems/MapSystem';
import { INITIAL_PLAYER_STATS } from '@/data/gameConfig';
import { STARTER_ITEMS } from '@/data/items';
import { INITIAL_SKILLS } from '@/data/skills';
import { createMonster } from '@/data/monsters';
import { NPCS } from '@/data/npcs';
import { createQuestInstance } from '@/data/quests';

type GameAction =
  | { type: 'MOVE_PLAYER'; direction: Direction }
  | { type: 'ATTACK_MONSTER'; monsterId: string }
  | { type: 'UPDATE_MONSTERS'; monsters: Monster[] }
  | { type: 'REMOVE_MONSTER'; monsterId: string }
  | { type: 'ADD_MESSAGE'; message: string; messageType: 'info' | 'combat' | 'loot' | 'system' }
  | { type: 'UPDATE_PLAYER'; player: Player }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'SET_TARGET'; targetId: string | null }
  | { type: 'SET_DESTINATION'; destination: { x: number; y: number } | null }
  | { type: 'ADD_DAMAGE_TEXT'; damage: number; position: { x: number; y: number }; damageType: 'player' | 'monster' }
  | { type: 'CLEAR_OLD_DAMAGE_TEXTS' }
  | { type: 'QUEUE_RESPAWN'; monster: Monster; respawnTime: number }
  | { type: 'PROCESS_RESPAWNS' }
  | { type: 'ADD_MONSTER'; monster: Monster }
  | { type: 'EQUIP_ITEM'; itemId: string }
  | { type: 'TRIGGER_EQUIP_ANIMATION'; slot: keyof Equipment }
  | { type: 'UNLOCK_SKILL'; skillId: string }
  | { type: 'USE_SKILL'; skillId: string; targetPosition?: { x: number; y: number } }
  | { type: 'UPDATE_PROJECTILES'; projectiles: any[] }
  | { type: 'ADD_SKILL_POINT' }
  | { type: 'SET_UNLOCKED_SKILLS'; skills: string[] }
  | { type: 'SET_SKILL_POINTS'; skillPoints: number }
  | { type: 'SET_MULTIPLAYER_CONNECTED'; connected: boolean }
  | { type: 'ADD_ONLINE_PLAYER'; player: OnlinePlayer }
  | { type: 'UPDATE_ONLINE_PLAYER'; playerId: number; position: { x: number; y: number } }
  | { type: 'UPDATE_ONLINE_PLAYER_STATS'; playerId: number; hp: number; maxHp: number; level: number }
  | { type: 'REMOVE_ONLINE_PLAYER'; playerId: number }
  | { type: 'SET_ONLINE_PLAYERS'; players: OnlinePlayer[] }
  | { type: 'ATTACK_PLAYER'; targetPlayerId: number }
  | { type: 'UPDATE_PVP_STATUS' }
  | { type: 'RECEIVE_PVP_DAMAGE'; damage: number; attackerId: number }
  | { type: 'PVP_DEATH'; killerId: number }
  | { type: 'INTERACT_NPC'; npcId: string }
  | { type: 'CLOSE_NPC_DIALOGUE' }
  | { type: 'BUY_ITEM'; itemId: string; npcId: string }
  | { type: 'SELL_ITEM'; itemId: string; npcId: string }
  | { type: 'MOVE_INVENTORY_ITEM'; fromIndex: number; toIndex: number }
  | { type: 'UNEQUIP_TO_SLOT'; slot: string; targetIndex: number }
  | { type: 'SWAP_EQUIPMENT'; fromSlot: string; toSlot: string }
  | { type: 'ACCEPT_QUEST'; questId: string }
  | { type: 'COMPLETE_QUEST'; questId: string }
  | { type: 'UPDATE_QUEST_PROGRESS'; questId: string; objectiveIndex: number; progress: number }
  | { type: 'PLAYER_DEATH' }
  | { type: 'RESPAWN_PLAYER' }
  | { type: 'UPDATE_INVULNERABILITY' };

const initialPlayer: Player = {
  id: 'player',
  name: 'Hero',
  position: { x: 10, y: 10 },
  direction: Direction.DOWN,
  sprite: 'player',
  ...INITIAL_PLAYER_STATS,
  inventory: STARTER_ITEMS,
  equipment: {},
  pvpStatus: {
    flag: PvPFlag.NONE,
    flagExpiration: null,
    lastAttackTime: null,
    attackedBy: null,
    canAttack: true,
  },
};

const mapWidth = 50;
const mapHeight = 50;

const initialState: GameState = {
  player: initialPlayer,
  monsters: [
    createMonster('RAT', 'rat1', 15, 15),
    createMonster('RAT', 'rat2', 20, 12),
    createMonster('TROLL', 'troll1', 25, 20),
    createMonster('SKELETON', 'skeleton1', 30, 30),
  ],
  npcs: NPCS,
  map: (() => {
    console.log('[GameContext] STARTING MAP GENERATION - VERSION 2.0.1');
    console.log('[GameContext] Map dimensions:', mapWidth, 'x', mapHeight);
    const generatedMap = MapSystem.generateMap(mapWidth, mapHeight);
    console.log('[GameContext] Map generation COMPLETE, tiles:', generatedMap.length, 'x', generatedMap[0]?.length);
    const stats = MapSystem.getMapStats(generatedMap);
    console.log('=== MAP STATISTICS ===');
    console.log(`Total tiles: ${stats.totalTiles}`);
    console.log(`GRASS: ${stats.tileCount.GRASS} (${((stats.tileCount.GRASS / stats.totalTiles) * 100).toFixed(1)}%)`);
    console.log(`WATER: ${stats.tileCount.WATER} (${((stats.tileCount.WATER / stats.totalTiles) * 100).toFixed(1)}%)`);
    console.log(`DIRT: ${stats.tileCount.DIRT} (${((stats.tileCount.DIRT / stats.totalTiles) * 100).toFixed(1)}%)`);
    console.log(`STONE: ${stats.tileCount.STONE} (${((stats.tileCount.STONE / stats.totalTiles) * 100).toFixed(1)}%)`);
    console.log(`WALL: ${stats.tileCount.WALL} (${((stats.tileCount.WALL / stats.totalTiles) * 100).toFixed(1)}%)`);
    console.log('=====================');
    return generatedMap;
  })(),
  messages: [
    {
      id: '1',
      text: 'Welcome to Tibia Web Edition!',
      timestamp: Date.now(),
      type: 'system',
    },
    {
      id: '2',
      text: 'Use WASD or Arrow keys to move. Click on monsters to auto-attack!',
      timestamp: Date.now(),
      type: 'info',
    },
  ],
  isPaused: false,
  camera: { x: 10, y: 10 },
  targetId: null,
  destinationPosition: null,
  damageTexts: [],
  respawnQueue: [],
  skills: INITIAL_SKILLS,
  skillPoints: 0,
  projectiles: [],
  multiplayer: {
    connected: false,
    onlinePlayers: new Map(),
  },
  activeQuests: [],
  completedQuests: [],
  activeNPC: null,
  isDead: false,
  deathTimestamp: null,
  invulnerable: false,
  invulnerableUntil: null,
  destination: null,
  unlockedSkills: [],
};

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MOVE_PLAYER':
      return state;
    case 'UPDATE_PLAYER':
      return {
        ...state,
        player: action.player,
        camera: action.player.position,
      };
    case 'UPDATE_MONSTERS':
      return {
        ...state,
        monsters: action.monsters,
      };
    case 'REMOVE_MONSTER': {
      const killedMonster = state.monsters.find((m) => m.id !== action.monsterId);
      let updatedQuests = state.activeQuests;
      let newMessages = [...state.messages];
      
      // Auto-update quest progress when monster is killed
      if (killedMonster) {
        updatedQuests = state.activeQuests.map(quest => {
          const updatedObjectives = quest.objectives.map(objective => {
            // Check if objective requires killing this type of monster
            if (objective.type === 'kill' && objective.target.toLowerCase() === killedMonster.type.toLowerCase()) {
              const newCurrent = Math.min(objective.current + 1, objective.required);
              const wasUpdated = newCurrent > objective.current;
              
              // Add quest progress notification
              if (wasUpdated) {
                newMessages = [
                  ...newMessages.slice(-19),
                  {
                    id: `quest-progress-${Date.now()}-${Math.random()}`,
                    text: `🎯 Quest Progress: ${quest.name} - ${newCurrent}/${objective.required} ${objective.target}s killed`,
                    timestamp: Date.now(),
                    type: 'system' as const,
                  },
                ];
              }
              
              return {
                ...objective,
                current: newCurrent
              };
            }
            return objective;
          });
          
          // Check if quest is now complete
          const isComplete = updatedObjectives.every(obj => obj.current >= obj.required);
          if (isComplete && quest.status !== QuestStatus.COMPLETED && quest.status !== QuestStatus.FINISHED) {
            newMessages = [
              ...newMessages.slice(-19),
              {
                id: `quest-complete-${Date.now()}-${Math.random()}`,
                text: `✅ Quest Completed: ${quest.name}! Return to NPC to claim your reward!`,
                timestamp: Date.now(),
                type: 'system' as const,
              },
            ];
          }
          
          return { ...quest, objectives: updatedObjectives, completed: isComplete };
        });
      }
      
      return {
        ...state,
        monsters: state.monsters.filter((m) => m.id !== action.monsterId),
        activeQuests: updatedQuests,
        messages: newMessages,
      };
    }
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages.slice(-19),
          {
            id: `${Date.now()}-${Math.random()}`,
            text: action.message,
            timestamp: Date.now(),
            type: action.messageType,
          },
        ],
      };
    case 'TOGGLE_PAUSE':
      return {
        ...state,
        isPaused: !state.isPaused,
      };
    case 'SET_TARGET':
      return {
        ...state,
        targetId: action.targetId,
      };
    case 'SET_DESTINATION':
      return {
        ...state,
        destinationPosition: action.destination,
      };
    case 'ADD_DAMAGE_TEXT':
      return {
        ...state,
        damageTexts: [
          ...state.damageTexts,
          {
            id: `${Date.now()}-${Math.random()}`,
            damage: action.damage,
            position: action.position,
            timestamp: Date.now(),
            type: action.damageType,
          },
        ],
      };
    case 'CLEAR_OLD_DAMAGE_TEXTS':
      return {
        ...state,
        damageTexts: state.damageTexts.filter(
          (dt) => Date.now() - dt.timestamp < 1000
        ),
      };
    case 'QUEUE_RESPAWN':
      return {
        ...state,
        respawnQueue: [
          ...state.respawnQueue,
          {
            monster: action.monster,
            respawnTime: action.respawnTime,
          },
        ],
      };
    case 'PROCESS_RESPAWNS': {
      const now = Date.now();
      const toRespawn = state.respawnQueue.filter((entry) => entry.respawnTime <= now);
      const remaining = state.respawnQueue.filter((entry) => entry.respawnTime > now);
      
      return {
        ...state,
        monsters: [...state.monsters, ...toRespawn.map((entry) => entry.monster)],
        respawnQueue: remaining,
      };
    }
    case 'ADD_MONSTER':
      return {
        ...state,
        monsters: [...state.monsters, action.monster],
      };
    case 'EQUIP_ITEM': {
      const item = state.player.inventory.find((i) => i.id === action.itemId);
      if (!item || !item.type) return state;

      // Determinar o slot baseado no tipo do item
      let slot: keyof typeof state.player.equipment | null = null;
      switch (item.type) {
        case ItemType.WEAPON:
          slot = 'weapon';
          break;
        case ItemType.ARMOR:
          slot = 'armor';
          break;
        case ItemType.SHIELD:
          slot = 'shield';
          break;
        case ItemType.HELMET:
          slot = 'helmet';
          break;
        case ItemType.AMULET:
          slot = 'amulet';
          break;
        case ItemType.RING:
          slot = 'ring';
          break;
        case ItemType.BOOTS:
          slot = 'boots';
          break;
        default:
          return state; // Item não é equipável
      }

      if (!slot) return state;

      // Remover item do inventário
      const newInventory = state.player.inventory.filter((i) => i.id !== action.itemId);

      // Se já tem item equipado no slot, devolver ao inventário
      const currentEquipped = state.player.equipment[slot];
      if (currentEquipped) {
        newInventory.push(currentEquipped);
      }

      // Equipar novo item
      const newEquipment = {
        ...state.player.equipment,
        [slot]: item,
      };

      return {
        ...state,
        player: {
          ...state.player,
          inventory: newInventory,
          equipment: newEquipment,
        },
        messages: [
          ...state.messages.slice(-19),
          {
            id: `${Date.now()}-${Math.random()}`,
            text: `Equipped ${item.name}!`,
            timestamp: Date.now(),
            type: 'system',
          },
        ],
      };
    }
    case 'UNLOCK_SKILL': {
      const skillIndex = state.skills.findIndex((s) => s.id === action.skillId);
      if (skillIndex === -1 || state.skills[skillIndex].unlocked || state.skillPoints < 1) {
        return state;
      }

      const newSkills = [...state.skills];
      newSkills[skillIndex] = { ...newSkills[skillIndex], unlocked: true };

      return {
        ...state,
        skills: newSkills,
        skillPoints: state.skillPoints - 1,
      };
    }
    case 'ADD_SKILL_POINT':
      return {
        ...state,
        skillPoints: state.skillPoints + 1,
      };
    case 'UPDATE_PROJECTILES':
      return {
        ...state,
        projectiles: action.projectiles,
      };
    case 'SET_UNLOCKED_SKILLS': {
      const newSkills = INITIAL_SKILLS.map(skill => ({
        ...skill,
        unlocked: action.skills.includes(skill.id),
      }));
      return {
        ...state,
        skills: newSkills,
      };
    }
    case 'SET_SKILL_POINTS':
      return {
        ...state,
        skillPoints: action.skillPoints,
      };
    case 'SET_MULTIPLAYER_CONNECTED':
      return {
        ...state,
        multiplayer: {
          ...state.multiplayer,
          connected: action.connected,
        },
      };
    case 'ADD_ONLINE_PLAYER': {
      const newPlayers = new Map(state.multiplayer.onlinePlayers);
      newPlayers.set(action.player.playerId, action.player);
      return {
        ...state,
        multiplayer: {
          ...state.multiplayer,
          onlinePlayers: newPlayers,
        },
      };
    }
    case 'UPDATE_ONLINE_PLAYER': {
      const player = state.multiplayer.onlinePlayers.get(action.playerId);
      if (!player) return state;
      const updatedPlayers = new Map(state.multiplayer.onlinePlayers);
      updatedPlayers.set(action.playerId, {
        ...player,
        position: action.position,
      });
      return {
        ...state,
        multiplayer: {
          ...state.multiplayer,
          onlinePlayers: updatedPlayers,
        },
      };
    }
    case 'UPDATE_ONLINE_PLAYER_STATS': {
      const player = state.multiplayer.onlinePlayers.get(action.playerId);
      if (!player) return state;
      const updatedPlayers = new Map(state.multiplayer.onlinePlayers);
      updatedPlayers.set(action.playerId, {
        ...player,
        hp: action.hp,
        maxHp: action.maxHp,
        level: action.level,
      });
      return {
        ...state,
        multiplayer: {
          ...state.multiplayer,
          onlinePlayers: updatedPlayers,
        },
      };
    }
    case 'REMOVE_ONLINE_PLAYER': {
      const newPlayers = new Map(state.multiplayer.onlinePlayers);
      newPlayers.delete(action.playerId);
      return {
        ...state,
        multiplayer: {
          ...state.multiplayer,
          onlinePlayers: newPlayers,
        },
      };
    }
    case 'SET_ONLINE_PLAYERS': {
      const newPlayers = new Map<number, OnlinePlayer>();
      action.players.forEach(player => {
        newPlayers.set(player.playerId, player);
      });
      return {
        ...state,
        multiplayer: {
          ...state.multiplayer,
          onlinePlayers: newPlayers,
        },
      };
    }
    case 'UPDATE_PVP_STATUS': {
      return {
        ...state,
        player: {
          ...state.player,
          pvpStatus: PvPSystem.updatePvPStatus(state.player),
        },
      };
    }
    case 'RECEIVE_PVP_DAMAGE': {
      const newHp = Math.max(0, state.player.hp - action.damage);
      
      // Aplicar flag de vítima
      const newPvpStatus = PvPSystem.applyVictimFlag(state.player, action.attackerId);
      
      return {
        ...state,
        player: {
          ...state.player,
          hp: newHp,
          pvpStatus: newPvpStatus,
        },
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text: `You received ${action.damage} damage from another player!`,
            timestamp: Date.now(),
            type: 'combat' as const,
          },
        ],
      };
    }
    case 'PVP_DEATH': {
      const respawnedPlayer = PvPSystem.respawnPlayer(state.player);
      
      return {
        ...state,
        player: respawnedPlayer,
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text: `You were killed by another player! Lost ${PvPSystem.calculateXPLoss(state.player)} XP.`,
            timestamp: Date.now(),
            type: 'system' as const,
          },
        ],
      };
    }
    case 'INTERACT_NPC': {
      return {
        ...state,
        activeNPC: action.npcId,
      };
    }
    case 'CLOSE_NPC_DIALOGUE': {
      return {
        ...state,
        activeNPC: null,
      };
    }
    case 'BUY_ITEM': {
      const npc = state.npcs.find(n => n.id === action.npcId);
      if (!npc || !npc.shop) return state;
      
      const shopItem = npc.shop.find(si => si.item.id === action.itemId);
      if (!shopItem) return state;
      
      // Verificar se tem gold suficiente
      if (state.player.gold < shopItem.buyPrice) {
        return {
          ...state,
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              text: `Not enough gold! Need ${shopItem.buyPrice} gold.`,
              timestamp: Date.now(),
              type: 'system' as const,
            },
          ],
        };
      }
      
      // Criar novo item com ID único
      const newItem = {
        ...shopItem.item,
        id: `${shopItem.item.id}_${Date.now()}`,
      };
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold - shopItem.buyPrice,
          inventory: [...state.player.inventory, newItem],
        },
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text: `Bought ${shopItem.item.name} for ${shopItem.buyPrice} gold.`,
            timestamp: Date.now(),
            type: 'loot' as const,
          },
        ],
      };
    }
    case 'SELL_ITEM': {
      const npc = state.npcs.find(n => n.id === action.npcId);
      if (!npc || !npc.shop) return state;
      
      const itemIndex = state.player.inventory.findIndex(i => i.id === action.itemId);
      if (itemIndex === -1) return state;
      
      const item = state.player.inventory[itemIndex];
      const shopItem = npc.shop.find(si => si.item.name === item.name);
      
      if (!shopItem) {
        return {
          ...state,
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              text: `${npc.name} doesn't buy this item.`,
              timestamp: Date.now(),
              type: 'system' as const,
            },
          ],
        };
      }
      
      const newInventory = [...state.player.inventory];
      newInventory.splice(itemIndex, 1);
      
      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + shopItem.sellPrice,
          inventory: newInventory,
        },
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text: `Sold ${item.name} for ${shopItem.sellPrice} gold.`,
            timestamp: Date.now(),
            type: 'loot' as const,
          },
        ],
      };
    }
    case 'ACCEPT_QUEST': {
      const quest = createQuestInstance(action.questId);
      
      if (!quest) return state;
      
      // Verificar se já tem a quest
      if (state.activeQuests.some(q => q.id === action.questId)) {
        return state;
      }
      
      return {
        ...state,
        activeQuests: [...state.activeQuests, { ...quest, status: 'ACTIVE' as any }],
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text: `Quest accepted: ${quest.name}`,
            timestamp: Date.now(),
            type: 'system' as const,
          },
        ],
      };
    }
    case 'UPDATE_QUEST_PROGRESS': {
      const questIndex = state.activeQuests.findIndex(q => q.id === action.questId);
      if (questIndex === -1) return state;
      
      const newQuests = [...state.activeQuests];
      const quest = { ...newQuests[questIndex] };
      quest.objectives = [...quest.objectives];
      quest.objectives[action.objectiveIndex] = {
        ...quest.objectives[action.objectiveIndex],
        current: action.progress,
      };
      
      // Verificar se todos os objetivos foram completados
      const allCompleted = quest.objectives.every(obj => obj.current >= obj.required);
      if (allCompleted) {
        quest.status = 'COMPLETED' as any;
      }
      
      newQuests[questIndex] = quest;
      
      return {
        ...state,
        activeQuests: newQuests,
      };
    }
    case 'COMPLETE_QUEST': {
      const questIndex = state.activeQuests.findIndex(q => q.id === action.questId);
      if (questIndex === -1) return state;
      
      const quest = state.activeQuests[questIndex];
      const newActiveQuests = state.activeQuests.filter(q => q.id !== action.questId);
      
      // Aplicar recompensas
      const newPlayer = {
        ...state.player,
        experience: state.player.experience + quest.rewards.xp,
        gold: state.player.gold + quest.rewards.gold,
        inventory: [...state.player.inventory, ...quest.rewards.items.map(item => ({
          ...item,
          id: `${item.id}_${Date.now()}`,
        }))],
      };
      
      return {
        ...state,
        player: newPlayer,
        activeQuests: newActiveQuests,
        completedQuests: [...state.completedQuests, action.questId],
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            text: `Quest completed: ${quest.name}! Received ${quest.rewards.xp} XP and ${quest.rewards.gold} gold.`,
            timestamp: Date.now(),
            type: 'system' as const,
          },
        ],
      };
    }
    case 'MOVE_INVENTORY_ITEM': {
      const newInventory = [...state.player.inventory];
      const fromItem = newInventory[action.fromIndex];
      const toItem = newInventory[action.toIndex];
      
      // Swap items
      newInventory[action.fromIndex] = toItem;
      newInventory[action.toIndex] = fromItem;
      
      return {
        ...state,
        player: {
          ...state.player,
          inventory: newInventory,
        },
      };
    }
    case 'UNEQUIP_TO_SLOT': {
      const equipment = state.player.equipment as any;
      const item = equipment[action.slot];
      if (!item) return state;
      
      const newInventory = [...state.player.inventory];
      newInventory[action.targetIndex] = item;
      
      return {
        ...state,
        player: {
          ...state.player,
          inventory: newInventory,
          equipment: {
            ...state.player.equipment,
            [action.slot]: undefined,
          },
        },
      };
    }
    case 'SWAP_EQUIPMENT': {
      const equipment = state.player.equipment as any;
      const fromItem = equipment[action.fromSlot];
      const toItem = equipment[action.toSlot];
      
      return {
        ...state,
        player: {
          ...state.player,
          equipment: {
            ...state.player.equipment,
            [action.fromSlot]: toItem,
            [action.toSlot]: fromItem,
          },
        },
      };
    }
    case 'PLAYER_DEATH': {
      // Drop 1-3 random items from inventory (not equipped items)
      const droppedItems: any[] = [];
      const newInventory = [...state.player.inventory];
      const dropCount = Math.min(Math.floor(Math.random() * 3) + 1, newInventory.length);
      
      for (let i = 0; i < dropCount; i++) {
        if (newInventory.length > 0) {
          const randomIndex = Math.floor(Math.random() * newInventory.length);
          droppedItems.push(newInventory[randomIndex]);
          newInventory.splice(randomIndex, 1);
        }
      }
      
      // Lose 10% XP
      const xpLoss = Math.floor(state.player.experience * 0.1);
      const newXP = Math.max(0, state.player.experience - xpLoss);
      
      return {
        ...state,
        isDead: true,
        deathTimestamp: Date.now(),
        player: {
          ...state.player,
          hp: 0,
          experience: newXP,
          inventory: newInventory,
        },
        messages: [
          ...state.messages,
          {
            id: `${Date.now()}-death`,
            text: `💀 You died! Lost ${xpLoss} XP and ${droppedItems.length} items.`,
            timestamp: Date.now(),
            type: 'system' as const,
          },
        ],
      };
    }
    case 'RESPAWN_PLAYER': {
      const SPAWN_POINT = { x: 8, y: 8 };
      
      return {
        ...state,
        isDead: false,
        deathTimestamp: null,
        invulnerable: true,
        invulnerableUntil: Date.now() + 5000, // 5 seconds invulnerability
        player: {
          ...state.player,
          hp: state.player.maxHp,
          mana: state.player.maxMana,
          position: SPAWN_POINT,
        },
        targetId: null,
        destination: null,
        messages: [
          ...state.messages,
          {
            id: `${Date.now()}-respawn`,
            text: '✨ You respawned at the spawn point. Invulnerable for 5 seconds.',
            timestamp: Date.now(),
            type: 'system' as const,
          },
        ],
      };
    }
    case 'UPDATE_INVULNERABILITY': {
      if (state.invulnerable && state.invulnerableUntil && Date.now() >= state.invulnerableUntil) {
        return {
          ...state,
          invulnerable: false,
          invulnerableUntil: null,
        };
      }
      return state;
    }
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
