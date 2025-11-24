import { Player, Item, ItemType } from '@/types/game';

export class ItemSystem {
  static useItem(player: Player, item: Item): { player: Player; message: string } | null {
    switch (item.type) {
      case ItemType.POTION:
        return this.usePotion(player, item);
      case ItemType.FOOD:
        return this.useFood(player, item);
      default:
        return null;
    }
  }

  private static usePotion(player: Player, item: Item): { player: Player; message: string } {
    let hpRestore = 0;
    let manaRestore = 0;

    if (item.name.toLowerCase().includes('health')) {
      hpRestore = 50;
    } else if (item.name.toLowerCase().includes('mana')) {
      manaRestore = 30;
    } else {
      // Poção genérica
      hpRestore = 30;
      manaRestore = 20;
    }

    const newHp = Math.min(player.maxHp, player.hp + hpRestore);
    const newMana = Math.min(player.maxMana, player.mana + manaRestore);

    // Decrementar quantidade ou remover item do inventário
    let newInventory: Item[];
    if (item.stackable && item.quantity > 1) {
      // Decrementar quantidade
      newInventory = player.inventory.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      // Remover item completamente
      newInventory = player.inventory.filter((i) => i.id !== item.id);
    }

    return {
      player: {
        ...player,
        hp: newHp,
        mana: newMana,
        inventory: newInventory,
      },
      message: `Used ${item.name}! Restored ${hpRestore} HP and ${manaRestore} Mana.`,
    };
  }

  private static useFood(player: Player, item: Item): { player: Player; message: string } {
    const hpRestore = 20;
    const newHp = Math.min(player.maxHp, player.hp + hpRestore);

    // Decrementar quantidade ou remover item do inventário
    let newInventory: Item[];
    if (item.stackable && item.quantity > 1) {
      // Decrementar quantidade
      newInventory = player.inventory.map((i) => 
        i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
      );
    } else {
      // Remover item completamente
      newInventory = player.inventory.filter((i) => i.id !== item.id);
    }

    return {
      player: {
        ...player,
        hp: newHp,
        inventory: newInventory,
      },
      message: `Ate ${item.name}! Restored ${hpRestore} HP.`,
    };
  }

  static equipItem(player: Player, item: Item): { player: Player; message: string } | null {
    if (
      item.type !== ItemType.WEAPON &&
      item.type !== ItemType.ARMOR &&
      item.type !== ItemType.HELMET &&
      item.type !== ItemType.SHIELD &&
      item.type !== ItemType.BOOTS &&
      item.type !== ItemType.AMULET &&
      item.type !== ItemType.RING
    ) {
      return null;
    }

    const equipment = { ...player.equipment };
    let unequippedItem: Item | undefined;

    switch (item.type) {
      case ItemType.WEAPON:
        unequippedItem = equipment.weapon;
        equipment.weapon = item;
        break;
      case ItemType.ARMOR:
        unequippedItem = equipment.armor;
        equipment.armor = item;
        break;
      case ItemType.HELMET:
        unequippedItem = equipment.helmet;
        equipment.helmet = item;
        break;
      case ItemType.SHIELD:
        unequippedItem = equipment.shield;
        equipment.shield = item;
        break;
      case ItemType.BOOTS:
        unequippedItem = equipment.boots;
        equipment.boots = item;
        break;
      case ItemType.AMULET:
        unequippedItem = equipment.amulet;
        equipment.amulet = item;
        break;
      case ItemType.RING:
        unequippedItem = equipment.ring;
        equipment.ring = item;
        break;
    }

    // Remover item do inventário e adicionar o item desequipado
    let newInventory = player.inventory.filter((i) => i.id !== item.id);
    if (unequippedItem) {
      newInventory = [...newInventory, unequippedItem];
    }

    return {
      player: {
        ...player,
        equipment,
        inventory: newInventory,
      },
      message: `Equipped ${item.name}!`,
    };
  }
}
