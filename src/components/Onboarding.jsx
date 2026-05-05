import React, { useState } from 'react';
import './Onboarding.css';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ habit: '', struggle: '', starter: '' });

  const questions = [
    {
      text: "Vee-vee! Welcome to the world of tasks! I'm Eevee, your productivity partner.",
      options: ["Next"]
    },
    {
      text: "First, tell me, what time of day do you feel most energetic?",
      field: "habit",
      options: ["Morning", "Afternoon", "Night"]
    },
    {
      text: "And what do you struggle with the most?",
      field: "struggle",
      options: ["Procrastination", "Forgetting", "Overworking"]
    }
  ];

  const handleOptionClick = (option) => {
    const currentQ = questions[step];

    if (currentQ.field) {
      setAnswers(prev => ({ ...prev, [currentQ.field]: option }));
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Auto-assign random starter ID since the question was removed
      const starterIds = [1, 4, 7]; // Bulbasaur, Charmander, Squirtle
      const starterId = starterIds[Math.floor(Math.random() * starterIds.length)];

      onComplete({ ...answers, starterId });
    }
  };

  const currentQ = questions[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal glass-panel">
        <div className="guide-container">
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png"
            alt="Eevee Guide"
            className="guide-sprite"
          />
        </div>

        <div className="dialog-box">
          <p className="dialog-text retro-text">{currentQ.text}</p>

          <div className="options-container">
            {currentQ.options.map(opt => (
              <button
                key={opt}
                className="dialog-option"
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
