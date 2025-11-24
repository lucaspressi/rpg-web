import { useGame } from '@/contexts/GameContext';
import { useDragDrop } from '@/contexts/DragDropContext';
import { ItemSystem } from '@/systems/ItemSystem';
import { ItemType, Item } from '@/types/game';
import { toast } from 'sonner';
import { Coins } from 'lucide-react';
import { useState, DragEvent } from 'react';

export default function InventoryPanel() {
  const { state, dispatch } = useGame();
  const { player } = state;
  const { dragData, startDrag, endDrag } = useDragDrop();
  const [animatingSlot, setAnimatingSlot] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ type: 'inventory' | 'equipment'; index?: number; slot?: string } | null>(null);

  const handleItemClick = (index: number) => {
    const item = player.inventory[index];
    if (!item) return;

    // Se for item consumível (poção ou comida), usar
    if (item.type === ItemType.POTION || item.type === ItemType.FOOD) {
      const useResult = ItemSystem.useItem(player, item);
      if (useResult) {
        dispatch({ type: 'UPDATE_PLAYER', player: useResult.player });
        dispatch({ type: 'ADD_MESSAGE', message: useResult.message, messageType: 'loot' });
        toast.success(useResult.message);
        return;
      }
    }

    // Se for item equipável, equipar
    const equipableTypes = [ItemType.WEAPON, ItemType.ARMOR, ItemType.HELMET, ItemType.SHIELD, ItemType.BOOTS, ItemType.AMULET, ItemType.RING];
    if (equipableTypes.includes(item.type)) {
      // Determinar o slot
      let slot: string = '';
      switch (item.type) {
        case ItemType.WEAPON: slot = 'weapon'; break;
        case ItemType.ARMOR: slot = 'armor'; break;
        case ItemType.HELMET: slot = 'helmet'; break;
        case ItemType.SHIELD: slot = 'shield'; break;
        case ItemType.BOOTS: slot = 'boots'; break;
        case ItemType.AMULET: slot = 'amulet'; break;
        case ItemType.RING: slot = 'ring'; break;
      }

      // Trigger animation
      setAnimatingSlot(slot);
      setTimeout(() => setAnimatingSlot(null), 600);

      dispatch({ type: 'EQUIP_ITEM', itemId: item.id });
      toast.success(`✨ Equipped ${item.name}!`, {
        description: item.attack ? `Attack +${item.attack}` : item.defense ? `Defense +${item.defense}` : undefined,
      });
      return;
    }

    toast.info(`${item.name} cannot be used or equipped.`);
  };

  // Drag handlers para inventory
  const handleInventoryDragStart = (e: DragEvent, item: Item, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    startDrag({
      item,
      sourceType: 'inventory',
      sourceIndex: index,
    });
  };

  const handleInventoryDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ type: 'inventory', index });
  };

  const handleInventoryDrop = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!dragData) return;

    // Mover item de inventory para inventory
    if (dragData.sourceType === 'inventory' && dragData.sourceIndex !== undefined) {
      dispatch({ 
        type: 'MOVE_INVENTORY_ITEM', 
        fromIndex: dragData.sourceIndex, 
        toIndex: targetIndex 
      });
      toast.success('Item moved');
    }
    // Mover item de equipment para inventory
    else if (dragData.sourceType === 'equipment' && dragData.sourceSlot) {
      dispatch({ 
        type: 'UNEQUIP_TO_SLOT', 
        slot: dragData.sourceSlot, 
        targetIndex 
      });
      toast.success(`Unequipped ${dragData.item.name}`);
    }

    endDrag();
  };

  // Drag handlers para equipment
  const handleEquipmentDragStart = (e: DragEvent, item: Item, slot: string) => {
    e.dataTransfer.effectAllowed = 'move';
    startDrag({
      item,
      sourceType: 'equipment',
      sourceSlot: slot,
    });
  };

  const handleEquipmentDragOver = (e: DragEvent, slot: string) => {
    e.preventDefault();
    
    // Validar se o item pode ser equipado neste slot
    if (dragData && dragData.sourceType === 'inventory') {
      const item = dragData.item;
      const validSlot = getSlotForItemType(item.type);
      if (validSlot !== slot) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }
    
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ type: 'equipment', slot });
  };

  const handleEquipmentDrop = (e: DragEvent, slot: string) => {
    e.preventDefault();
    setDragOverSlot(null);

    if (!dragData) return;

    // Equipar item do inventory
    if (dragData.sourceType === 'inventory') {
      const item = dragData.item;
      const validSlot = getSlotForItemType(item.type);
      
      if (validSlot !== slot) {
        toast.error('Cannot equip this item in this slot');
        endDrag();
        return;
      }

      // Trigger animation
      setAnimatingSlot(slot);
      setTimeout(() => setAnimatingSlot(null), 600);

      dispatch({ type: 'EQUIP_ITEM', itemId: item.id });
      toast.success(`✨ Equipped ${item.name}!`);
    }
    // Swap entre slots de equipment
    else if (dragData.sourceType === 'equipment' && dragData.sourceSlot) {
      dispatch({ 
        type: 'SWAP_EQUIPMENT', 
        fromSlot: dragData.sourceSlot, 
        toSlot: slot 
      });
      toast.success('Equipment swapped');
    }

    endDrag();
  };

  const handleDragEnd = () => {
    setDragOverSlot(null);
    endDrag();
  };

  const getSlotForItemType = (type: ItemType): string => {
    switch (type) {
      case ItemType.WEAPON: return 'weapon';
      case ItemType.ARMOR: return 'armor';
      case ItemType.HELMET: return 'helmet';
      case ItemType.SHIELD: return 'shield';
      case ItemType.BOOTS: return 'boots';
      case ItemType.AMULET: return 'amulet';
      case ItemType.RING: return 'ring';
      default: return '';
    }
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case ItemType.POTION: return '🧪';
      case ItemType.FOOD: return '🍖';
      case ItemType.WEAPON: return '⚔️';
      case ItemType.ARMOR: return '🛡️';
      case ItemType.HELMET: return '⛑️';
      case ItemType.SHIELD: return '🛡️';
      case ItemType.BOOTS: return '👢';
      case ItemType.AMULET: return '📿';
      case ItemType.RING: return '💍';
      case ItemType.MISC: return '📦';
      default: return '❓';
    }
  };

  const EquipmentSlot = ({ label, item, icon, slotKey }: { label: string; item?: Item; icon: string; slotKey: string }) => {
    const isAnimating = animatingSlot === slotKey;
    const isDragOver = dragOverSlot?.type === 'equipment' && dragOverSlot.slot === slotKey;
    
    return (
      <div 
        className={`border-2 border-border rounded bg-muted/30 p-2 hover:bg-muted/50 transition-colors ${isAnimating ? 'equipment-slot-equipped' : ''} ${isDragOver ? 'ring-2 ring-primary' : ''}`}
        draggable={!!item}
        onDragStart={(e) => item && handleEquipmentDragStart(e, item, slotKey)}
        onDragOver={(e) => handleEquipmentDragOver(e, slotKey)}
        onDrop={(e) => handleEquipmentDrop(e, slotKey)}
        onDragEnd={handleDragEnd}
      >
        <div className="text-[10px] retro-font text-muted-foreground mb-1 text-center">{label}</div>
        {item ? (
          <div className="text-center cursor-move">
            <div className="text-xl mb-1">{getItemIcon(item.type)}</div>
            <div className="text-[9px] retro-font text-foreground truncate">{item.name}</div>
            {item.attack && (
              <div className="text-[8px] retro-font text-green-500">⚔️ +{item.attack}</div>
            )}
            {item.defense && (
              <div className="text-[8px] retro-font text-blue-500">🛡️ +{item.defense}</div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xl mb-1 opacity-30">{icon}</div>
            <div className="text-[9px] retro-font text-muted-foreground/50">Empty</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="game-panel p-4 space-y-4">
      {/* Gold Display */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-yellow-700/30 border-2 border-yellow-600/50 rounded p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="pixel-font text-sm text-yellow-500">Gold</span>
          </div>
          <span className="retro-font text-lg font-bold text-yellow-400">{player.gold}</span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div>
        <h3 className="pixel-font text-xs text-primary mb-2">Inventory (Drag to move/equip)</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 16 }).map((_, index) => {
            const item = player.inventory[index];
            const isDragOver = dragOverSlot?.type === 'inventory' && dragOverSlot.index === index;
            
            return (
              <div
                key={index}
                className={`aspect-square border-2 border-border bg-muted/30 rounded flex flex-col items-center justify-center hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer group relative ${isDragOver ? 'ring-2 ring-primary bg-primary/20' : ''}`}
                title={item ? `${item.name}\n${item.description}\nClick to use/equip or drag to move` : 'Empty slot'}
                onClick={() => handleItemClick(index)}
                draggable={!!item}
                onDragStart={(e) => item && handleInventoryDragStart(e, item, index)}
                onDragOver={(e) => handleInventoryDragOver(e, index)}
                onDrop={(e) => handleInventoryDrop(e, index)}
                onDragEnd={handleDragEnd}
                onDragLeave={() => setDragOverSlot(null)}
              >
                {item && (
                  <>
                    <div className="text-2xl group-hover:scale-110 transition-transform cursor-move">
                      {getItemIcon(item.type)}
                    </div>
                    {item.stackable && item.quantity > 1 && (
                      <div className="absolute bottom-0 right-0 bg-primary/80 text-primary-foreground text-[10px] retro-font px-1 rounded-tl">
                        {item.quantity}
                      </div>
                    )}
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                      <div className="bg-background border-2 border-border rounded px-2 py-1 whitespace-nowrap">
                        <div className="text-[10px] retro-font text-foreground font-bold">{item.name}</div>
                        <div className="text-[9px] retro-font text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Slots */}
      <div>
        <h4 className="pixel-font text-xs text-secondary mb-2">Equipment (Drag to swap)</h4>
        <div className="grid grid-cols-3 gap-1.5">
          <EquipmentSlot label="Helmet" item={player.equipment.helmet} icon="⛑️" slotKey="helmet" />
          <EquipmentSlot label="Amulet" item={player.equipment.amulet} icon="📿" slotKey="amulet" />
          <EquipmentSlot label="Backpack" item={player.equipment.backpack} icon="🎒" slotKey="backpack" />
          
          <EquipmentSlot label="Weapon" item={player.equipment.weapon} icon="⚔️" slotKey="weapon" />
          <EquipmentSlot label="Armor" item={player.equipment.armor} icon="🛡️" slotKey="armor" />
          <EquipmentSlot label="Shield" item={player.equipment.shield} icon="🛡️" slotKey="shield" />
          
          <EquipmentSlot label="Ring" item={player.equipment.ring} icon="💍" slotKey="ring" />
          <EquipmentSlot label="Legs" item={player.equipment.legs} icon="👖" slotKey="legs" />
          <EquipmentSlot label="Arrows" item={player.equipment.arrows} icon="🏹" slotKey="arrows" />
          
          <div className="col-span-3 grid grid-cols-1">
            <EquipmentSlot label="Boots" item={player.equipment.boots} icon="👢" slotKey="boots" />
          </div>
        </div>
      </div>
    </div>
  );
}
