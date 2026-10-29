'use client';
import { triggerGameOver } from '@/utils/gameEvents';
import { useState, useEffect } from 'react';

const ICONS = ['✦', '✧', '★', '☆', '✶', '✷']; // Simple symbols

export default function MemoryFlip({ onGameOver }) {
  const [state, setState] = useState('idle');
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeStr, setTimeStr] = useState('0:00');

  function initGame() {
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon }));
    setCards(deck);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStartTime(Date.now());
    (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')));
  }

  useEffect(() => {
    if (state !== 'playing') return;
    const int = setInterval(() => {
      const secs = Math.floor((Date.now() - startTime) / 1000);
      setTimeStr(`${Math.floor(secs / 60)}:${(secs % 60).toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(int);
  }, [state, startTime]);

  function flipCard(id) {
    if (state !== 'playing') return;
    if (flipped.length === 2) return; // Wait for mismatch to clear
    if (flipped.includes(id) || matched.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].icon === cards[b].icon) {
        setTimeout(() => {
          const newMatched = [...matched, a, b];
          setMatched(newMatched);
          setFlipped([]);
          if (newMatched.length === cards.length) {
            finishGame();
          }
        }, 400);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }

  function finishGame() {
    setState('won');
    const durationSecs = Math.floor((Date.now() - startTime) / 1000);
    // Score: base 500 - (moves*10) - (secs*2)
    const finalScore = Math.max(50, 500 - (moves * 10) - (durationSecs * 2));
    triggerGameOver(finalScore, { moves, durationSecs });
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {state === 'idle' && (
        <div className="surface-elevated p-6 sm:p-12 text-center rounded-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-warning">Memory Flip</h2>
          <p className="text-text-secondary mb-8">Match the celestial symbols. Fewer moves and faster time equals a higher score.</p>
          <button onClick={initGame} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}

      {state === 'playing' && (
        <>
          <div className="flex justify-between items-center mb-4 px-2 text-sm font-mono text-text-secondary">
            <div>Moves: <span className="text-text-primary">{moves}</span></div>
            <div>Time: <span className="text-text-primary">{timeStr}</span></div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
              const isMatched = matched.includes(card.id);
              return (
                <button
                  key={card.id}
                  onClick={() => flipCard(card.id)}
                  className={`aspect-square flex items-center justify-center text-2xl rounded-xl transition-all duration-300 border border-border
                    ${isFlipped ? 'bg-bg-elevated rotate-0' : 'bg-bg-secondary rotate-y-180'}
                    ${isMatched ? 'border-warning/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]' : ''}
                  `}
                >
                  {isFlipped ? <span className={isMatched ? 'text-warning' : 'text-text-primary'}>{card.icon}</span> : ''}
                </button>
              );
            })}
          </div>
        </>
      )}

      {state === 'won' && (
        <div className="surface-elevated p-6 sm:p-12 text-center rounded-2xl">
          <h2 className="font-display text-2xl font-bold text-success mb-2">Board Cleared!</h2>
          <p className="text-text-secondary mb-4">Solved in {moves} moves.</p>
        </div>
      )}
    </div>
  );
}
