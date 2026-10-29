'use client';
import { useEffect, useRef, useState } from 'react';
import { triggerGameOver } from '@/utils/gameEvents';

export default function NeonSnake() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  
  const gameRef = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    lastMove: performance.now(),
    moveInterval: 200,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const GRID = 20;
    const TILE = canvas.width / GRID;
    
    let animFrame;
    let lastTime = performance.now();

    function spawnFood() {
      const g = gameRef.current;
      let newFood;
      while (true) {
        newFood = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
        if (!g.snake.some(s => s.x === newFood.x && s.y === newFood.y)) break;
      }
      g.food = newFood;
    }

    function loop(time) {
      if (!gameRef.current.active) return;
      const dt = time - lastTime;
      lastTime = time;
      const g = gameRef.current;

      if (time - g.lastMove > g.moveInterval) {
        g.lastMove = time;
        g.dir = g.nextDir;
        const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
        
        // Collision
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || g.snake.some(s => s.x === head.x && s.y === head.y)) {
          g.active = false;
          setState('gameover');
          triggerGameOver((g.snake.length - 1) * 10, { length: g.snake.length });
          return;
        }

        g.snake.unshift(head);
        
        if (head.x === g.food.x && head.y === g.food.y) {
          setScore((g.snake.length - 1) * 10);
          spawnFood();
          g.moveInterval = Math.max(120, 200 - g.snake.length * 5);
        } else {
          g.snake.pop();
        }
      }

      // Render
      ctx.fillStyle = '#0D1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(148,163,184,0.05)';
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath(); ctx.moveTo(i*TILE, 0); ctx.lineTo(i*TILE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i*TILE); ctx.lineTo(canvas.width, i*TILE); ctx.stroke();
      }

      ctx.shadowBlur = 15; ctx.shadowColor = '#FB7185'; ctx.fillStyle = '#FB7185';
      ctx.fillRect(g.food.x * TILE + 2, g.food.y * TILE + 2, TILE - 4, TILE - 4);

      ctx.shadowBlur = 10; ctx.shadowColor = '#22D3EE'; ctx.fillStyle = '#22D3EE';
      g.snake.forEach((s, i) => {
        ctx.globalAlpha = Math.max(0.3, 1 - i * 0.03);
        ctx.fillRect(s.x * TILE + 1, s.y * TILE + 1, TILE - 2, TILE - 2);
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(loop);
    }

    function handleKey(e) {
      const g = gameRef.current;
      if (!g.active) return;
      const k = e.key;
      if ((k === 'ArrowUp' || k === 'w') && g.dir.y === 0) g.nextDir = { x: 0, y: -1 };
      if ((k === 'ArrowDown' || k === 's') && g.dir.y === 0) g.nextDir = { x: 0, y: 1 };
      if ((k === 'ArrowLeft' || k === 'a') && g.dir.x === 0) g.nextDir = { x: -1, y: 0 };
      if ((k === 'ArrowRight' || k === 'd') && g.dir.x === 0) g.nextDir = { x: 1, y: 0 };
    }
    window.addEventListener('keydown', handleKey);

    if (state === 'playing') {
      gameRef.current = {
        snake: [{ x: 10, y: 10 }],
        dir: { x: 1, y: 0 },
        nextDir: { x: 1, y: 0 },
        food: { x: 15, y: 15 },
        lastMove: performance.now(),
        moveInterval: 200,
        active: true,
      };
      setScore(0);
      lastTime = performance.now();
      animFrame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', handleKey);
    };
  }, [state]); // Note: ONLY `state` is in dependency array

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square bg-bg-secondary rounded-2xl overflow-hidden border border-border shadow-card">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">Score: {score}</div>
      {state === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-cyan">Neon Snake</h2>
          <p className="text-text-secondary mb-8 text-center max-w-md">Use Arrow Keys or WASD to eat the red nodes.</p>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}
      {state === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-base/80 z-20">
          <div className="text-2xl font-bold text-error">Game Over</div>
        </div>
      )}
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block" />
    </div>
  );
}
