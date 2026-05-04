import React, { useState } from 'react';
import './Onboarding.css';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ habit: '', struggle: '', starter: '' });

  const questions = [
    {
      text: "Hello there! Welcome to the world of tasks! My name is Oak. People call me the Task Professor.",
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
    },
    {
      text: "Fascinating! Now, choose your starter companion to help you on your journey!",
      field: "starter",
      options: ["Bulbasaur (Steady)", "Charmander (Fierce)", "Squirtle (Flowing)"]
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
      let starterId = 1; // Bulbasaur
      if (answers.starter.includes("Charmander") || option.includes("Charmander")) starterId = 4;
      if (answers.starter.includes("Squirtle") || option.includes("Squirtle")) starterId = 7;
      
      onComplete({ ...answers, starterId });
    }
  };

  const currentQ = questions[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal glass-panel">
        <div className="oak-container">
          <img 
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" 
            alt="Professor Oak" 
            className="oak-sprite"
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
