import React, { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { LayoutGrid, Box } from 'lucide-react';
import './Pastures.css';

export default function Pastures({ collection, onBuddyChange }) {
  // Simple state: 2 Boxes (Pasture A and Pasture B)
  const [boxes, setBoxes] = useState({
    A: collection.slice(0, Math.ceil(collection.length / 2)),
    B: collection.slice(Math.ceil(collection.length / 2))
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      // Logic to move between or within boxes
      // For brevity, we'll just handle reordering in Box A for now
      setBoxes((prev) => {
        const oldIndex = prev.A.findIndex(p => p.id === active.id);
        const newIndex = prev.A.findIndex(p => p.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          return { ...prev, A: arrayMove(prev.A, oldIndex, newIndex) };
        }
        return prev;
      });
    }
  };

  return (
    <div className="pastures-container animate-fade-in">
      <div className="pastures-header">
        <div className="flex items-center gap-2">
          <LayoutGrid size={18} className="text-green-400" />
          <h3 className="retro-text text-sm">Pasture Management</h3>
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Box A (Active Pasture)</span>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="pasture-grid-wrapper glass-panel">
          <SortableContext 
            items={boxes.A.map(p => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="pasture-grid">
              {boxes.A.map((pokemon) => (
                <SortableItem 
                  key={pokemon.id} 
                  id={pokemon.id} 
                  pokemon={pokemon} 
                  onBuddy={() => onBuddyChange(pokemon.id)}
                />
              ))}
            </div>
          </SortableContext>
        </div>
      </DndContext>
      
      <div className="pastures-footer-hint">
        <Box size={12} />
        <span>Drag to organize your collection. Click a Pokémon to set as Buddy.</span>
      </div>
    </div>
  );
}
