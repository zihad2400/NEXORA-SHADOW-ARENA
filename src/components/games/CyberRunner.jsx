'use client';
import { useEffect, useRef, useState } from 'react';
import { triggerGameOver } from '@/utils/gameEvents';

export default function CyberRunner() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);

  const gameRef = useRef({
    player: { x: 50, y: 300, w: 30, h: 30, vy: 0, jumpForce: -12, gravity: 0.6 },
    obstacles: [],
    lastSpawn: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 600, H = 400;
    let animFrame;
    let lastTime = performance.now();

    function loop(time) {
      if (!gameRef.current.active) return;
      const dt = Math.min((time - lastTime) / 16.66, 2); // Normalize to 60fps
      lastTime = time;
      const g = gameRef.current;

      // Player Physics
      g.player.vy += g.player.gravity * dt;
      g.player.y += g.player.vy * dt;
      
      // Ground collision
      if (g.player.y + g.player.h > H - 50) {
        g.player.y = H - 50 - g.player.h;
        g.player.vy = 0;
      }

      // Spawn Obstacles
      if (time - g.lastSpawn > 1500) {
        g.obstacles.push({ x: W, y: H - 80, w: 20, h: 30, speed: 6 });
        g.lastSpawn = time;
      }

      // Update Obstacles
      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const o = g.obstacles[i];
        o.x -= o.speed * dt;

        // Collision
        if (
          g.player.x < o.x + o.w && g.player.x + g.player.w > o.x &&
          g.player.y < o.y + o.h && g.player.y + g.player.h > o.y
        ) {
          g.active = false;
          setState('gameover');
          triggerGameOver(Math.floor(scoreRef.current), { distance: scoreRef.current });
          return;
        }

        // Passed obstacle -> Score up
        if (o.x + o.w < 0) {
          g.obstacles.splice(i, 1);
          scoreRef.current += 10;
          setScore(scoreRef.current);
        }
      }

      // Render
      ctx.fillStyle = '#0D1120';
      ctx.fillRect(0, 0, W, H);

      // Ground
      ctx.fillStyle = '#22D3EE';
      ctx.fillRect(0, H - 50, W, 50);

      // Player
      ctx.fillStyle = '#8B5CF6';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#8B5CF6';
      ctx.fillRect(g.player.x, g.player.y, g.player.w, g.player.h);

      // Obstacles
      ctx.fillStyle = '#FB7185';
      ctx.shadowColor = '#FB7185';
      g.obstacles.forEach(o => ctx.fillRect(o.x, o.y, o.w, o.h));
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(loop);
    }

    function handleJump() {
      const g = gameRef.current;
      if (!g.active) return;
      // Only jump if on ground
      if (g.player.y + g.player.h >= H - 50 - 1) {
        g.player.vy = g.player.jumpForce;
      }
    }

    function handleKey(e) {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'w') {
        e.preventDefault();
        handleJump();
      }
    }

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('mousedown', handleJump);
    canvas.addEventListener('touchstart', handleJump, { passive: false });

    if (state === 'playing') {
      gameRef.current = {
        player: { x: 50, y: 300, w: 30, h: 30, vy: 0, jumpForce: -12, gravity: 0.6 },
        obstacles: [],
        lastSpawn: performance.now(),
        active: true,
      };
      scoreRef.current = 0;
      setScore(0);
      lastTime = performance.now();
      animFrame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('mousedown', handleJump);
      canvas.removeEventListener('touchstart', handleJump);
    };
  }, [state]); // <--- Important: remove score from dependencies

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[3/2] bg-bg-secondary rounded-2xl overflow-hidden border border-border shadow-card">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">Dist: {score}</div>
      {state === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-violet-soft">Cyber Runner</h2>
          <p className="text-text-secondary mb-8 text-center max-w-md">Jump over the blocks. Use Space or Click/Tap.</p>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}
      {state === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20">
          <div className="text-2xl font-bold text-error mb-4">Crashed</div>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-ghost-nexora">Play Again</button>
        </div>
      )}
      <canvas ref={canvasRef} width={600} height={400} className="w-full h-full block" />
    </div>
  );
}
