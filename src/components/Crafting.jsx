import React, { useState } from 'react';
import { Hammer, Package, Zap, ChevronRight } from 'lucide-react';
import './Crafting.css';

export default function Crafting({ inventory, setInventory, onCraft }) {
  const recipes = [
    { 
      id: 'pokeball', 
      name: 'Poké Ball', 
      ingredients: { apricorns: 3, iron: 1 },
      result: 'pokeballs',
      icon: '🔴'
    },
    { 
      id: 'greatball', 
      name: 'Great Ball', 
      ingredients: { apricorns: 2, iron: 2, shards: 1 },
      result: 'greatballs',
      icon: '🔵'
    }
  ];

  const canCraft = (recipe) => {
    return Object.entries(recipe.ingredients).every(([ing, count]) => (inventory[ing] || 0) >= count);
  };

  const handleCraft = (recipe) => {
    if (!canCraft(recipe)) return;

    setInventory(prev => {
      const next = { ...prev };
      Object.entries(recipe.ingredients).forEach(([ing, count]) => {
        next[ing] -= count;
      });
      next[recipe.result] = (next[recipe.result] || 0) + 1;
      return next;
    });
    
    if (onCraft) onCraft(recipe.name);
  };

  return (
    <div className="crafting-wrapper animate-fade-in">
      <div className="glass-panel inventory-header">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-blue-400" />
          <h3 className="retro-text text-sm">Backpack</h3>
        </div>
        <div className="inventory-grid">
          {Object.entries(inventory).map(([item, count]) => (
            <div key={item} className="inventory-item">
              <span className="item-label">{item}</span>
              <span className="item-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel recipes-container">
        <div className="flex items-center gap-2 mb-6">
          <Hammer size={18} className="text-yellow-400" />
          <h3 className="retro-text text-sm">Forge</h3>
        </div>
        
        <div className="recipes-list">
          {recipes.map(recipe => (
            <div key={recipe.id} className={`recipe-card ${canCraft(recipe) ? 'ready' : 'locked'}`}>
              <div className="recipe-info">
                <span className="recipe-icon">{recipe.icon}</span>
                <div className="recipe-details">
                  <span className="recipe-name">{recipe.name}</span>
                  <div className="ingredients-list">
                    {Object.entries(recipe.ingredients).map(([ing, count]) => (
                      <span key={ing} className={`ing-badge ${(inventory[ing] || 0) >= count ? 'have' : 'need'}`}>
                        {count}x {ing}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                disabled={!canCraft(recipe)}
                onClick={() => handleCraft(recipe)}
                className="craft-btn"
              >
                Craft <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
