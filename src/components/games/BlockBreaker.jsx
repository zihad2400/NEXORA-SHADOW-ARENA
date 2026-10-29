'use client';
import { useEffect, useRef, useState } from 'react';
import { triggerGameOver } from '@/utils/gameEvents';

export default function BlockBreaker() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // Use ref for score to avoid re-renders during the game loop

  const gameRef = useRef({
    paddle: { x: 160, w: 80, h: 12 },
    ball: { x: 200, y: 250, dx: 3, dy: -3, r: 6 }, // Slower speed
    blocks: [],
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 400, H = 400;
    
    let animFrame;

    function initGame() {
      const g = gameRef.current;
      g.paddle = { x: 160, w: 80, h: 12 };
      g.ball = { x: W / 2, y: H - 50, dx: 3, dy: -3, r: 6 };
      g.blocks = [];
      const cols = 8, rows = 5, bw = 40, bh = 20, padding = 5, offsetTop = 50, offsetLeft = 20;
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          g.blocks.push({
            x: c * (bw + padding) + offsetLeft,
            y: r * (bh + padding) + offsetTop,
            w: bw, h: bh, alive: true,
            color: r < 2 ? '#FB7185' : r < 4 ? '#8B5CF6' : '#22D3EE'
          });
        }
      }
      g.active = true;
      scoreRef.current = 0;
      setScore(0);
    }

    function loop() {
      if (!gameRef.current.active) return;
      const g = gameRef.current;

      // Update ball
      g.ball.x += g.ball.dx;
      g.ball.y += g.ball.dy;

      // Walls
      if (g.ball.x - g.ball.r < 0 || g.ball.x + g.ball.r > W) g.ball.dx *= -1;
      if (g.ball.y - g.ball.r < 0) g.ball.dy *= -1;

      // Bottom (game over)
      if (g.ball.y + g.ball.r > H) {
        g.active = false;
        setState('gameover');
        triggerGameOver(scoreRef.current, { blocksHit: scoreRef.current / 10 });
        return;
      }

      // Paddle
      if (
        g.ball.y + g.ball.r > H - 30 &&
        g.ball.x > g.paddle.x && g.ball.x < g.paddle.x + g.paddle.w
      ) {
        g.ball.dy = -Math.abs(g.ball.dy);
        g.ball.dx = ((g.ball.x - (g.paddle.x + g.paddle.w/2)) / (g.paddle.w/2)) * 4;
      }

      // Blocks
      let remaining = 0;
      g.blocks.forEach(b => {
        if (!b.alive) return;
        remaining++;
        if (
          g.ball.x + g.ball.r > b.x && g.ball.x - g.ball.r < b.x + b.w &&
          g.ball.y + g.ball.r > b.y && g.ball.y - g.ball.r < b.y + b.h
        ) {
          b.alive = false;
          g.ball.dy *= -1;
          scoreRef.current += 10;
          setScore(scoreRef.current);
        }
      });

      if (remaining === 0) {
        g.active = false;
        setState('gameover');
        triggerGameOver(scoreRef.current + 50, { cleared: true });
        return;
      }

      // Render
      ctx.fillStyle = '#0D1120';
      ctx.fillRect(0, 0, W, H);

      // Blocks
      g.blocks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = b.color;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      });

      // Paddle
      ctx.fillStyle = '#F8FAFC';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#8B5CF6';
      ctx.fillRect(g.paddle.x, H - 30, g.paddle.w, g.paddle.h);

      // Ball
      ctx.beginPath();
      ctx.arc(g.ball.x, g.ball.y, g.ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#22D3EE';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#22D3EE';
      ctx.fill();
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(loop);
    }

    function handleMouseMove(e) {
      if (!gameRef.current.active) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      let x = (e.clientX - rect.left) * scaleX;
      x = Math.max(0, Math.min(W - gameRef.current.paddle.w, x - gameRef.current.paddle.w / 2));
      gameRef.current.paddle.x = x;
    }

    canvas.addEventListener('pointermove', handleMouseMove);

    if (state === 'playing') {
      initGame();
      animFrame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      canvas.removeEventListener('pointermove', handleMouseMove);
    };
  }, [state]); // Only state in dependency array

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square bg-bg-secondary rounded-2xl overflow-hidden border border-border shadow-card">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">Score: {score}</div>
      {state === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-violet-soft">Block Breaker</h2>
          <p className="text-text-secondary mb-8 text-center max-w-md">Move the mouse to control the paddle. Don't let the ball fall.</p>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}
      {state === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20">
          <div className="text-2xl font-bold text-error mb-4">Game Over</div>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-ghost-nexora">Try Again</button>
        </div>
      )}
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block touch-none" />
    </div>
  );
}
