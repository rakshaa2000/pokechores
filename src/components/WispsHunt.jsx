import React, { useState, useEffect } from 'react';
import './WispsHunt.css';

export default function WispsHunt({ onComplete }) {
  const [wisps, setWisps] = useState([]);

  useEffect(() => {
    // Generate 5 random wisps
    const newWisps = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10,
    }));
    setWisps(newWisps);
  }, []);

  const collectWisp = (id) => {
    const remaining = wisps.filter(w => w.id !== id);
    setWisps(remaining);
    
    if (remaining.length === 0) {
      onComplete();
    }
  };

  if (wisps.length === 0) return null;

  return (
    <div className="wisps-container">
      {wisps.map(wisp => (
        <button
          key={wisp.id}
          className="wisp-item animate-float"
          style={{ left: `${wisp.x}%`, top: `${wisp.y}%` }}
          onClick={() => collectWisp(wisp.id)}
          title="Collect Wisp"
        >
          <div className="wisp-core"></div>
        </button>
      ))}
    </div>
  );
}
