'use client';
import { useEffect, useRef, useState } from 'react';
import { triggerGameOver } from '@/utils/gameEvents';

export default function NeonDodge() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle'); // idle | playing | gameover
  const [score, setScore] = useState(0);
  
  const gameRef = useRef({
    active: false,
    player: { x: 150, y: 150, size: 20 },
    obstacles: [],
    lastSpawn: 0,
    score: 0,
    startTime: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrame;
    let lastTime = performance.now();

    function resize() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function spawnObstacle() {
      const g = gameRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const edge = Math.floor(Math.random() * 4);
      let x, y, vx, vy;
      const speed = 100 + (g.score * 1.5);

      if (edge === 0) { x = Math.random() * w; y = -30; vx = 0; vy = speed; }
      else if (edge === 1) { x = Math.random() * w; y = h + 30; vx = 0; vy = -speed; }
      else if (edge === 2) { x = -30; y = Math.random() * h; vx = speed; vy = 0; }
      else { x = w + 30; y = Math.random() * h; vx = -speed; vy = 0; }

      g.obstacles.push({ x, y, vx, vy, size: 24 });
    }

    function loop(time) {
      if (!gameRef.current.active) return;
      
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      
      const g = gameRef.current;
      const w = canvas.width;
      const h = canvas.height;

      g.score += dt * 10;
      setScore(Math.floor(g.score));

      if (time - g.lastSpawn > 600 - Math.min(300, g.score * 2)) {
        spawnObstacle();
        g.lastSpawn = time;
      }

      for (let i = g.obstacles.length - 1; i >= 0; i--) {
        const o = g.obstacles[i];
        o.x += o.vx * dt;
        o.y += o.vy * dt;

        const px = g.player.x;
        const py = g.player.y;
        const pSize = g.player.size;
        
        if (
          px < o.x + o.size && px + pSize > o.x &&
          py < o.y + o.size && py + pSize > o.y
        ) {
          g.active = false;
          setState('gameover');
          triggerGameOver(Math.floor(g.score), { obstacles: g.obstacles.length });
          return;
        }

        if (o.x < -100 || o.x > w + 100 || o.y < -100 || o.y > h + 100) {
          g.obstacles.splice(i, 1);
        }
      }

      ctx.fillStyle = '#0D1120';
      ctx.fillRect(0, 0, w, h);

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#8B5CF6';
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(g.player.x, g.player.y, g.player.size, g.player.size);
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FB7185';
      ctx.fillStyle = '#FB7185';
      g.obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.size, o.size);
      });
      ctx.shadowBlur = 0;

      animationFrame = requestAnimationFrame(loop);
    }

    function handleMove(e) {
      if (!gameRef.current.active) return;
      const rect = canvas.getBoundingClientRect();
      const g = gameRef.current;
      
      let targetX = g.player.x;
      let targetY = g.player.y;

      if (e.touches) {
        targetX = e.touches[0].clientX - rect.left - g.player.size / 2;
        targetY = e.touches[0].clientY - rect.top - g.player.size / 2;
      } else {
        targetX = e.clientX - rect.left - g.player.size / 2;
        targetY = e.clientY - rect.top - g.player.size / 2;
      }

      g.player.x += (targetX - g.player.x) * 0.2;
      g.player.y += (targetY - g.player.y) * 0.2;
    }

    function handleKey(e) {
      if (!gameRef.current.active) return;
      const speed = 20;
      const g = gameRef.current;
      
      // Use canvas.width and canvas.height instead of undefined w and h
      const w = canvas.width;
      const h = canvas.height;

      if (e.key === 'ArrowLeft' || e.key === 'a') g.player.x -= speed;
      if (e.key === 'ArrowRight' || e.key === 'd') g.player.x += speed;
      if (e.key === 'ArrowUp' || e.key === 'w') g.player.y -= speed;
      if (e.key === 'ArrowDown' || e.key === 's') g.player.y += speed;
      
      g.player.x = Math.max(0, Math.min(w - g.player.size, g.player.x));
      g.player.y = Math.max(0, Math.min(h - g.player.size, g.player.y));
    }

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('keydown', handleKey);

    if (state === 'playing') {
      gameRef.current = {
        active: true,
        player: { x: canvas.width / 2, y: canvas.height - 60, size: 24 },
        obstacles: [],
        lastSpawn: 0,
        score: 0,
        startTime: performance.now(),
      };
      setScore(0);
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('keydown', handleKey);
    };
  }, [state]);

  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] bg-bg-secondary rounded-2xl overflow-hidden border border-border shadow-card">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">
        Score: {score}
      </div>
      {state === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 backdrop-blur-sm z-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-violet-soft">Neon Dodge</h2>
          <p className="text-text-secondary mb-8 text-center max-w-md">Avoid the red blocks. Move with mouse, touch, or arrow keys.</p>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing'))} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}
      {state === 'gameover' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 backdrop-blur-sm z-20">
          <div className="text-2xl font-bold text-error mb-4">Game Over</div>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing'))} className="btn-ghost-nexora">Play Again</button>
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />
    </div>
  );
}
