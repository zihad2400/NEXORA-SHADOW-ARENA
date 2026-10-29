'use client';
import { triggerGameOver } from '@/utils/gameEvents';
import { useState, useEffect } from 'react';

export default function Cyber2048({ onGameOver }) {
  const [state, setState] = useState('idle');
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);

  const getEmptyCell = (g) => {
    const empty = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (g[r][c] === 0) empty.push({r, c});
    return empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
  };

  const addRandom = (g) => {
    const cell = getEmptyCell(g);
    if (cell) g[cell.r][cell.c] = Math.random() > 0.9 ? 4 : 2;
    return g;
  };

  function initGame() {
    let newGrid = Array(4).fill(0).map(() => Array(4).fill(0));
    newGrid = addRandom(addRandom(newGrid));
    setGrid(newGrid);
    setScore(0);
    (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')));
  }

  function move(dir) { // 0: up, 1: right, 2: down, 3: left
    if (state !== 'playing') return;
    let newGrid = grid.map(row => [...row]);
    let moved = false;
    let newScore = score;

    const merge = (row) => {
      let filtered = row.filter(v => v !== 0);
      for (let i = 0; i < filtered.length - 1; i++) {
        if (filtered[i] === filtered[i+1]) {
          filtered[i] *= 2;
          newScore += filtered[i];
          filtered.splice(i+1, 1);
          moved = true;
        }
      }
      while (filtered.length < 4) filtered.push(0);
      return filtered;
    };

    // Rotate grid based on direction, merge rows, rotate back
    const rotateRight = (g) => g[0].map((_, i) => g.map(row => row[i]).reverse());
    const rotateLeft = (g) => g[0].map((_, i) => g.map(row => row[row.length - 1 - i]));
    
    let rotations = dir === 0 ? 1 : dir === 1 ? 2 : dir === 2 ? 3 : 0;
    for (let i = 0; i < rotations; i++) newGrid = rotateRight(newGrid);
    
    for (let r = 0; r < 4; r++) {
      const oldRow = [...newGrid[r]];
      newGrid[r] = merge(newGrid[r]);
      if (newGrid[r].join() !== oldRow.join()) moved = true;
    }
    
    for (let i = 0; i < (4 - rotations) % 4; i++) newGrid = rotateRight(newGrid);

    if (moved) {
      newGrid = addRandom(newGrid);
      setGrid(newGrid);
      setScore(newScore);

      // Check game over (no moves left)
      let canMove = false;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (newGrid[r][c] === 0) canMove = true;
        if (r < 3 && newGrid[r][c] === newGrid[r+1][c]) canMove = true;
        if (c < 3 && newGrid[r][c] === newGrid[r][c+1]) canMove = true;
      }
      if (!canMove) {
        setState('gameover');
        triggerGameOver(newScore, {});
      }
      // Win condition (reach 2048)
      if (newGrid.some(row => row.some(v => v >= 2048)) && state === 'playing') {
        setState('won');
        triggerGameOver(newScore + 1000, { won: true });
      }
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (state !== 'playing') return;
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); move(0); }
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); move(1); }
      if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); move(2); }
      if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); move(3); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [grid, state, score]);

  const getColor = (val) => {
    if (val === 0) return 'bg-bg-elevated text-transparent';
    if (val === 2) return 'bg-bg-card text-text-primary';
    if (val === 4) return 'bg-violet/20 text-violet-soft';
    if (val === 8) return 'bg-violet/40 text-text-primary';
    if (val === 16) return 'bg-violet text-text-primary';
    if (val === 32) return 'bg-cyan/30 text-cyan-soft';
    if (val === 64) return 'bg-cyan text-bg-base';
    return 'bg-warning text-bg-base';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {state === 'idle' && (
        <div className="surface-elevated p-6 sm:p-12 text-center rounded-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Cyber 2048</h2>
          <p className="text-text-secondary mb-8">Combine tiles to reach 2048. Use arrow keys.</p>
          <button onClick={initGame} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}

      {(state === 'playing' || state === 'gameover' || state === 'won') && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-text-secondary font-mono">Score: <span className="text-text-primary">{score}</span></div>
            <button onClick={initGame} className="btn-ghost-nexora text-xs px-3 py-1">New Game</button>
          </div>
          <div className="relative bg-bg-secondary p-2 rounded-xl border border-border shadow-card">
            {state === 'gameover' && (
              <div className="absolute inset-0 z-10 bg-bg-base/80 flex flex-col items-center justify-center rounded-xl">
                <div className="text-2xl font-bold text-error mb-4">Game Over</div>
                <button onClick={initGame} className="btn-nexora">Try Again</button>
              </div>
            )}
            {state === 'won' && (
              <div className="absolute inset-0 z-10 bg-bg-base/80 flex flex-col items-center justify-center rounded-xl">
                <div className="text-2xl font-bold text-success mb-4">You reached 2048!</div>
                <button onClick={initGame} className="btn-nexora">Play Again</button>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {grid.flat().map((val, i) => (
                <div key={i} className={`aspect-square flex items-center justify-center rounded-lg font-bold text-xl transition-all duration-100 ${getColor(val)}`}>
                  {val > 0 ? val : ''}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
