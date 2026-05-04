import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LayoutGrid, Heart } from 'lucide-react';
import './Pastures.css';

function SortableItem({ id, pokemon, isBuddy, onBuddyChange }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`pasture-poke-card ${isBuddy ? 'buddy-highlight' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <LayoutGrid size={12} />
      </div>
      <div 
        className="poke-click-area"
        onClick={() => !isBuddy && onBuddyChange(pokemon.id)}
      >
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`} alt={pokemon.name} />
        <span className="poke-label">{pokemon.name}</span>
        {isBuddy && <div className="buddy-status-dot"></div>}
      </div>
    </div>
  );
}

export default function Pastures({ collection, currentBuddyId, onBuddyChange, onOrderChange }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(collection.map(p => p.id.toString()));
  }, [collection]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(newItems);
      
      // Map back to full pokemon objects and notify parent
      const newCollection = newItems.map(id => collection.find(p => p.id.toString() === id));
      onOrderChange(newCollection);
    }
  };

  return (
    <div className="pastures-container glass-panel animate-pop-in">
      <div className="pastures-header">
        <LayoutGrid className="text-green-400" />
        <h2 className="retro-text">Pasture Management</h2>
      </div>

      <div className="buddy-drop-zone">
        <div className="buddy-slot-display">
          <Heart className="text-red-500 animate-pulse" />
          <p className="text-xs text-gray-400">Current Buddy ID: {currentBuddyId}</p>
        </div>
        <p className="hint-text">Drag Pokémon to reorder your team!</p>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="pastures-grid">
          <SortableContext items={items} strategy={rectSortingStrategy}>
            {items.map(id => {
              const pokemon = collection.find(p => p.id.toString() === id);
              if (!pokemon) return null;
              return (
                <SortableItem 
                  key={id} 
                  id={id} 
                  pokemon={pokemon} 
                  isBuddy={pokemon.id === currentBuddyId}
                  onBuddyChange={onBuddyChange}
                />
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
