'use client';
import { triggerGameOver } from '@/utils/gameEvents';
import { useState, useEffect } from 'react';

export default function ReactionGrid({ onGameOver }) {
  const [state, setState] = useState('idle'); // idle | playing | gameover
  const [score, setScore] = useState(0);
  const [targetCell, setTargetCell] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Initialize 9 cells
  const [cells, setCells] = useState(Array(9).fill(null));

  useEffect(() => {
    let timer;
    if (state === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (state === 'playing' && timeLeft === 0) {
      setState('gameover');
      triggerGameOver(score, { timeSurvived: 30 });
    }
    return () => clearTimeout(timer);
  }, [state, timeLeft, score, onGameOver]);

  const spawnTarget = () => {
    const emptyCells = [];
    cells.forEach((c, i) => { if (c === null) emptyCells.push(i); });
    if (emptyCells.length === 0) return; // Board full
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    setTargetCell(randomCell);
    setCells(prev => {
      const newCells = [...prev];
      newCells[randomCell] = 'active';
      return newCells;
    });

    // Target disappears after a short time
    setTimeout(() => {
      setCells(prev => {
        const newCells = [...prev];
        if (newCells[randomCell] === 'active') newCells[randomCell] = null;
        return newCells;
      });
    }, 1000);
  };

  useEffect(() => {
    if (state !== 'playing') return;
    const interval = setInterval(spawnTarget, 1200);
    return () => clearInterval(interval);
  }, [state, cells]); // Using cells here to avoid spawning on occupied cells

  function handleCellClick(index) {
    if (state !== 'playing' || cells[index] !== 'active') return;
    
    // Hit!
    setScore(s => s + 10);
    setCells(prev => {
      const newCells = [...prev];
      newCells[index] = null;
      return newCells;
    });
  }

  function startGame() {
    setCells(Array(9).fill(null));
    setScore(0);
    setTimeLeft(30);
    (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')));
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {state === 'idle' && (
        <div className="surface-elevated p-6 sm:p-12 text-center rounded-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-success">Reaction Grid</h2>
          <p className="text-text-secondary mb-8">Click the green targets as fast as possible before they vanish. 30 seconds on the clock.</p>
          <button onClick={startGame} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}

      {state !== 'idle' && (
        <>
          <div className="flex justify-between items-center mb-6 px-2 font-mono">
            <div className="text-text-secondary">Score: <span className="text-text-primary">{score}</span></div>
            <div className={`text-${timeLeft <= 5 ? 'error' : 'text-secondary'} text-lg font-bold`}>Time: {timeLeft}s</div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 p-3 bg-bg-secondary rounded-2xl border border-border">
            {cells.map((cell, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(i)}
                className={`aspect-square rounded-xl transition-all duration-100 border border-border
                  ${cell === 'active' ? 'bg-success shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-95' : 'bg-bg-elevated hover:bg-bg-card'}
                `}
                aria-label="Grid cell"
              />
            ))}
          </div>

          {state === 'gameover' && (
            <div className="mt-6 text-center">
              <div className="text-2xl font-bold text-error mb-2">Time's Up!</div>
              <button onClick={startGame} className="btn-ghost-nexora">Play Again</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
