'use client';
import { triggerGameOver } from '@/utils/gameEvents';
import { useState } from 'react';

const COLORS = [
  { name: 'RED', hex: '#FB7185' },
  { name: 'CYAN', hex: '#22D3EE' },
  { name: 'GREEN', hex: '#34D399' },
  { name: 'YELLOW', hex: '#FBBF24' },
  { name: 'PURPLE', hex: '#8B5CF6' },
];

export default function ColorMatch({ onGameOver }) {
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [word, setWord] = useState({ name: '', hex: '' });
  const [isMatch, setIsMatch] = useState(false);

  const MAX_ROUNDS = 10;

  function generateRound() {
    const textColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const inkColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setWord({ name: textColor.name, hex: inkColor.hex });
    setIsMatch(textColor.name === inkColor.name);
  }

  function startGame() {
    setScore(0);
    setRound(1);
    (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')));
    generateRound();
  }

  function handleChoice(choice) {
    if (state !== 'playing') return;
    
    const correct = (choice === 'yes' && isMatch) || (choice === 'no' && !isMatch);
    
    if (correct) {
      setScore(s => s + 10);
    } else {
      setScore(s => Math.max(0, s - 5)); // Penalty for wrong
    }

    if (round >= MAX_ROUNDS) {
      const finalScore = score + (correct ? 10 : -5);
      setState('gameover');
      triggerGameOver(finalScore, { rounds: MAX_ROUNDS });
    } else {
      setRound(r => r + 1);
      generateRound();
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {state === 'idle' && (
        <div className="surface-elevated p-6 sm:p-12 text-center rounded-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-warning">Color Match</h2>
          <p className="text-text-secondary mb-8">Read the word. Does the color of the text match the word? 10 rounds.</p>
          <button onClick={startGame} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}

      {state === 'playing' && (
        <div className="surface-elevated p-4 sm:p-8 rounded-2xl text-center">
          <div className="flex justify-between text-sm font-mono text-text-secondary mb-8">
            <span>Round {round}/{MAX_ROUNDS}</span>
            <span>Score: {score}</span>
          </div>
          
          <div 
            className="text-6xl font-display font-bold mb-12 tracking-wider" 
            style={{ color: word.hex }}
          >
            {word.name}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleChoice('yes')} className="btn-nexora bg-success hover:bg-success/80 text-bg-base">YES</button>
            <button onClick={() => handleChoice('no')} className="btn-nexora bg-error hover:bg-error/80 text-bg-base">NO</button>
          </div>
        </div>
      )}

      {state === 'gameover' && (
        <div className="surface-elevated p-6 sm:p-12 text-center rounded-2xl">
          <h2 className="font-display text-2xl font-bold text-success mb-2">Focus Test Complete</h2>
          <p className="text-text-secondary mb-6">You scored {score} points.</p>
        </div>
      )}
    </div>
  );
}
