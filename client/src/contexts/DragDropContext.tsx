import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Item } from '@/types/game';

interface DragData {
  item: Item;
  sourceType: 'inventory' | 'equipment';
  sourceIndex?: number; // Para inventory slots
  sourceSlot?: string; // Para equipment slots (helmet, weapon, etc)
}

interface DragDropContextType {
  dragData: DragData | null;
  isDragging: boolean;
  startDrag: (data: DragData) => void;
  endDrag: () => void;
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [dragData, setDragData] = useState<DragData | null>(null);

  const startDrag = (data: DragData) => {
    setDragData(data);
  };

  const endDrag = () => {
    setDragData(null);
  };

  const value: DragDropContextType = {
    dragData,
    isDragging: dragData !== null,
    startDrag,
    endDrag,
  };

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}
