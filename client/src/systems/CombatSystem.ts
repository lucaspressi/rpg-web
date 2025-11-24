import { Character, GameMessage, Player, Item, Monster } from '@/types/game';
import { MovementSystem } from './MovementSystem';
import { StatsSystem } from './StatsSystem';

export class CombatSystem {
  static isInRange(attacker: Character, target: Character, range: number = 1): boolean {
    return MovementSystem.getDistance(attacker.position, target.position) <= range;
  }

  static calculateDamage(attacker: Character, target: Character): number {
    // Se o atacante for um Player, usa o sistema de stats
    if ('equipment' in attacker) {
      const damage = StatsSystem.calculateTotalDamage(attacker as Player);
      
      // Se o alvo for um Player, aplica defesa
      if ('equipment' in target) {
        const defense = StatsSystem.calculateTotalDefense(target as Player);
        return StatsSystem.calculateDamageReceived(damage, defense);
      }
      
      return damage;
    }
    
    // Monstros usam cálculo simples
    const baseDamage = attacker.level * 8 + 2;
    const variance = Math.random() * 0.4 + 0.8; // 80% a 120%
    return Math.floor(baseDamage * variance);
  }

  static attack(
    attacker: Character,
    target: Character,
    messages: GameMessage[],
    targetInvulnerable: boolean = false
  ): { target: Character; messages: GameMessage[]; killed: boolean } {
    if (!this.isInRange(attacker, target)) {
      return { target, messages, killed: false };
    }

    // Check if target is invulnerable
    if (targetInvulnerable) {
      return { target, messages, killed: false };
    }

    const damage = this.calculateDamage(attacker, target);
    const newHp = Math.max(0, target.hp - damage);
    const killed = newHp === 0;

    const newMessages = [
      ...messages,
      {
        id: `${Date.now()}-${Math.random()}`,
        text: `${attacker.name} attacks ${target.name} for ${damage} damage!`,
        timestamp: Date.now(),
        type: 'combat' as const,
      },
    ];

    if (killed) {
      newMessages.push({
        id: `${Date.now()}-${Math.random()}-kill`,
        text: `${target.name} has been defeated!`,
        timestamp: Date.now(),
        type: 'combat' as const,
      });
    }

    return {
      target: { ...target, hp: newHp },
      messages: newMessages,
      killed,
    };
  }

  static gainExperience(player: Player, experience: number): Player {
    const newExp = player.experience + experience;
    const expToLevel = player.level * 50; // Reduzido de 100 para 50

    if (newExp >= expToLevel) {
      // Level up!
      return {
        ...player,
        level: player.level + 1,
        experience: newExp - expToLevel,
        maxHp: player.maxHp + 15, // Aumentado de 10 para 15
        hp: player.maxHp + 15,
        maxMana: player.maxMana + 8, // Aumentado de 5 para 8
        mana: player.maxMana + 8,
      };
    }

    return {
      ...player,
      experience: newExp,
    };
  }

  static collectLoot(player: Player, monster: Monster, messages: GameMessage[]): {
    player: Player;
    messages: GameMessage[];
  } {
    const newMessages = [...messages];
    let newPlayer = { ...player };

    monster.loot.forEach((item) => {
      // Check if item is gold (id starts with 'gold' or name is 'Gold Coins')
      if (item.id.startsWith('gold') || item.name === 'Gold Coins') {
        newPlayer = {
          ...newPlayer,
          gold: newPlayer.gold + item.quantity,
        };
        newMessages.push({
          id: `${Date.now()}-${Math.random()}-loot`,
          text: `You received ${item.quantity} gold coins!`,
          timestamp: Date.now(),
          type: 'loot' as const,
        });
      } else {
        // Check if item is stackable and already exists in inventory
        if (item.stackable) {
          const existingItemIndex = newPlayer.inventory.findIndex(
            (invItem) => invItem.name === item.name && invItem.stackable
          );
          
          if (existingItemIndex !== -1) {
            // Stack with existing item
            const updatedInventory = [...newPlayer.inventory];
            updatedInventory[existingItemIndex] = {
              ...updatedInventory[existingItemIndex],
              quantity: updatedInventory[existingItemIndex].quantity + item.quantity,
            };
            
            newPlayer = {
              ...newPlayer,
              inventory: updatedInventory,
            };
            
            newMessages.push({
              id: `${Date.now()}-${Math.random()}-loot`,
              text: `You received ${item.quantity}x ${item.name}!`,
              timestamp: Date.now(),
              type: 'loot' as const,
            });
          } else {
            // Add as new stack
            newPlayer = {
              ...newPlayer,
              inventory: [...newPlayer.inventory, item],
            };
            newMessages.push({
              id: `${Date.now()}-${Math.random()}-loot`,
              text: `You received ${item.quantity}x ${item.name}!`,
              timestamp: Date.now(),
              type: 'loot' as const,
            });
          }
        } else {
          // Non-stackable item, add normally
          newPlayer = {
            ...newPlayer,
            inventory: [...newPlayer.inventory, item],
          };
          newMessages.push({
            id: `${Date.now()}-${Math.random()}-loot`,
            text: `You received ${item.name}!`,
            timestamp: Date.now(),
            type: 'loot' as const,
          });
        }
      }
    });

    return { player: newPlayer, messages: newMessages };
  }
}
