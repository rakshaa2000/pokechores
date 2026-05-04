import React, { useState } from 'react';
import { Hammer, Sparkles, Package } from 'lucide-react';
import './Crafting.css';

const RECIPES = [
  { id: 'pokeball', name: 'Poké Ball', ingredients: { apricorns: 3, iron: 1 }, result: 'pokeballs' },
  { id: 'greatball', name: 'Great Ball', ingredients: { apricorns: 5, iron: 3, shards: 1 }, result: 'greatballs' },
  { id: 'masterball', name: 'Master Ball', ingredients: { masterball_shard: 10 }, result: 'masterballs' },
];

export default function Crafting({ inventory, setInventory }) {
  const [crafting, setCrafting] = useState(null);

  const canCraft = (ingredients) => {
    return Object.entries(ingredients).every(([item, count]) => (inventory[item] || 0) >= count);
  };

  const handleCraft = (recipe) => {
    if (!canCraft(recipe.ingredients)) return;

    setCrafting(recipe.id);
    
    setTimeout(() => {
      setInventory(prev => {
        const next = { ...prev };
        Object.entries(recipe.ingredients).forEach(([item, count]) => {
          next[item] -= count;
        });
        next[recipe.result] = (next[recipe.result] || 0) + 1;
        return next;
      });
      setCrafting(null);
    }, 1500);
  };

  return (
    <div className="crafting-container glass-panel animate-pop-in">
      <div className="crafting-header">
        <Hammer className="text-orange-400" />
        <h2 className="retro-text">Forge & Craft</h2>
      </div>

      <div className="inventory-summary">
        {Object.entries(inventory).map(([item, count]) => (
          <div key={item} className="inv-pill">
            <Package size={12} />
            <span className="capitalize">{item.replace('_', ' ')}: {count}</span>
          </div>
        ))}
      </div>

      <div className="recipes-grid">
        {RECIPES.map(recipe => (
          <div key={recipe.id} className={`recipe-card ${canCraft(recipe.ingredients) ? 'available' : 'locked'}`}>
            <div className="recipe-info">
              <span className="recipe-name">{recipe.name}</span>
              <div className="ingredients-list">
                {Object.entries(recipe.ingredients).map(([ing, qty]) => (
                  <span key={ing} className={`ing-badge ${(inventory[ing] || 0) >= qty ? 'met' : 'missing'}`}>
                    {qty}x {ing.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
            <button 
              disabled={!canCraft(recipe.ingredients) || crafting}
              onClick={() => handleCraft(recipe)}
              className="craft-btn"
            >
              {crafting === recipe.id ? (
                <Sparkles className="animate-spin" size={16} />
              ) : (
                'Forge'
              )}
            </button>
          </div>
        ))}
      </div>

      {crafting && (
        <div className="crafting-overlay">
          <div className="hammer-anim">⚒️</div>
          <p className="retro-text text-sm">Forging {RECIPES.find(r => r.id === crafting).name}...</p>
        </div>
      )}
    </div>
  );
}
