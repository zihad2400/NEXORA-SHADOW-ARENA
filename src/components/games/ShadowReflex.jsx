'use client';
import { triggerGameOver } from '@/utils/gameEvents';
import { useState, useEffect, useRef } from 'react';

export default function ShadowReflex({ onGameOver }) {
  const [state, setState] = useState('idle'); // idle | waiting | ready | result
  const [reactionTime, setReactionTime] = useState(null);
  const [attempts, setAttempts] = useState([]);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  function startRound() {
    setState('waiting');
    setReactionTime(null);
    const delay = 1000 + Math.random() * 3000; // 1-4 seconds
    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setState('ready');
    }, delay);
  }

  function handleClick() {
    if (state === 'waiting') {
      // Clicked too early
      clearTimeout(timerRef.current);
      setState('result');
      setReactionTime('TOO EARLY');
    } else if (state === 'ready') {
      const time = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(time);
      setState('result');
      
      const newAttempts = [...attempts, time];
      setAttempts(newAttempts);

      // If this was the 5th attempt, finish the game
      if (newAttempts.length >= 5) {
        const avg = newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length;
        // Score logic: 1000 - average time
        const finalScore = Math.max(0, Math.round(1000 - avg));
        triggerGameOver(finalScore, { attempts: newAttempts, avg });
      }
    }
  }

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const bestTime = attempts.length ? Math.min(...attempts) : null;

  return (
    <div 
      className={`w-full max-w-2xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-card flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer select-none
        ${state === 'waiting' ? 'bg-bg-card' : state === 'ready' ? 'bg-cyan/20' : 'bg-bg-secondary'}`}
      onClick={handleClick}
    >
      {state === 'idle' && (
        <div className="text-center p-4 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4">Shadow Reflex</h2>
          <p className="text-text-secondary mb-8 max-w-md">Wait for the screen to turn cyan, then click as fast as possible. 5 attempts total. Early clicks reset the round.</p>
          <button onClick={(e) => { e.stopPropagation(); startRound(); }} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}

      {state === 'waiting' && (
        <div className="text-center animate-pulse">
          <div className="text-4xl text-text-secondary font-mono">Wait for it...</div>
        </div>
      )}

      {state === 'ready' && (
        <div className="text-center">
          <div className="text-6xl text-cyan font-bold font-display">CLICK!</div>
        </div>
      )}

      {state === 'result' && (
        <div className="text-center p-4 sm:p-8">
          <div className="text-text-secondary mb-2">Reaction Time</div>
          <div className={`text-5xl font-mono font-bold mb-6 ${reactionTime === 'TOO EARLY' ? 'text-error' : 'text-cyan'}`}>
            {reactionTime === 'TOO EARLY' ? 'Too Early!' : `${reactionTime}ms`}
          </div>
          
          <div className="flex gap-4 sm:p-8 justify-center text-sm mb-8 text-text-secondary">
            <div>Attempt: {attempts.length}/5</div>
            {bestTime && <div>Best: {bestTime}ms</div>}
          </div>

          {attempts.length < 5 && reactionTime !== 'TOO EARLY' && (
            <button onClick={(e) => { e.stopPropagation(); startRound(); }} className="btn-nexora">Next Attempt</button>
          )}
          
          {reactionTime === 'TOO EARLY' && (
            <button onClick={(e) => { e.stopPropagation(); startRound(); }} className="btn-nexora">Retry</button>
          )}

          {attempts.length >= 5 && (
            <div className="text-success font-bold mt-4">Game Complete!</div>
          )}
        </div>
      )}
    </div>
  );
}
