'use client';
import { triggerGameOver } from '@/utils/gameEvents';
import { useEffect, useRef, useState } from 'react';

export default function AsteroidHunter({ onGameOver }) {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);

  const gameRef = useRef({
    player: { x: 180, y: 340, w: 40, h: 20 },
    bullets: [],
    asteroids: [],
    lastSpawn: performance.now(),
    active: false,
    keys: { ArrowLeft: false, ArrowRight: false, Space: false }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 400, H = 400;
    let animFrame;
    let lastTime = performance.now();

    function loop(time) {
      if (!gameRef.current.active) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const g = gameRef.current;

      // Player Move
      if (g.keys.ArrowLeft) g.player.x -= 300 * dt;
      if (g.keys.ArrowRight) g.player.x += 300 * dt;
      g.player.x = Math.max(0, Math.min(W - g.player.w, g.player.x));

      // Shooting
      if (g.keys.Space && time - g.lastShot > 300) {
        g.bullets.push({ x: g.player.x + g.player.w / 2 - 2, y: g.player.y, w: 4, h: 12, vy: -500 });
        g.lastShot = time;
        g.keys.Space = false; // Require re-press for semi-auto feel
      }

      // Spawn Asteroids
      if (time - g.lastSpawn > 1200) {
        g.asteroids.push({
          x: Math.random() * (W - 30),
          y: -30,
          r: 15 + Math.random() * 15,
          vy: 50 + Math.random() * 50
        });
        g.lastSpawn = time;
      }

      // Update Bullets
      for (let i = g.bullets.length - 1; i >= 0; i--) {
        const b = g.bullets[i];
        b.y += b.vy * dt;
        if (b.y < -20) g.bullets.splice(i, 1);
      }

      // Update Asteroids & Collisions
      for (let i = g.asteroids.length - 1; i >= 0; i--) {
        const a = g.asteroids[i];
        a.y += a.vy * dt;

        // Hit ground (game over)
        if (a.y > H) {
          g.active = false;
          setState('gameover');
          triggerGameOver(score, { survived: time });
          return;
        }

        // Hit player
        if (
          a.x + a.r > g.player.x && a.x - a.r < g.player.x + g.player.w &&
          a.y + a.r > g.player.y
        ) {
          g.active = false;
          setState('gameover');
          triggerGameOver(score, { survived: time });
          return;
        }

        // Hit by bullet
        for (let j = g.bullets.length - 1; j >= 0; j--) {
          const b = g.bullets[j];
          const dx = (b.x + b.w/2) - a.x;
          const dy = (b.y + b.h/2) - a.y;
          if (Math.sqrt(dx*dx + dy*dy) < a.r) {
            a.dead = true;
            g.bullets.splice(j, 1);
            setScore(s => s + Math.floor(a.r));
            break;
          }
        }

        if (a.dead) g.asteroids.splice(i, 1);
      }

      // Render
      ctx.fillStyle = '#0D1120';
      ctx.fillRect(0, 0, W, H);
      
      // Starfield effect
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      for(let i=0; i<20; i++) ctx.fillRect(Math.random()*W, Math.random()*H, 2, 2);

      // Player
      ctx.fillStyle = '#22D3EE';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#22D3EE';
      ctx.beginPath();
      ctx.moveTo(g.player.x + g.player.w/2, g.player.y);
      ctx.lineTo(g.player.x, g.player.y + g.player.h);
      ctx.lineTo(g.player.x + g.player.w, g.player.y + g.player.h);
      ctx.fill();

      // Bullets
      ctx.fillStyle = '#F8FAFC';
      ctx.shadowBlur = 5;
      g.bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));

      // Asteroids
      ctx.fillStyle = '#FB7185';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FB7185';
      g.asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      animFrame = requestAnimationFrame(loop);
    }

    function keyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameRef.current.keys.ArrowLeft = true;
      if (e.key === 'ArrowRight' || e.key === 'd') gameRef.current.keys.ArrowRight = true;
      if (e.key === ' ') { e.preventDefault(); gameRef.current.keys.Space = true; }
    }
    function keyUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') gameRef.current.keys.ArrowLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd') gameRef.current.keys.ArrowRight = false;
      if (e.key === ' ') gameRef.current.keys.Space = false;
    }

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    if (state === 'playing') {
      gameRef.current = {
        player: { x: 180, y: 340, w: 40, h: 20 },
        bullets: [],
        asteroids: [],
        lastSpawn: performance.now(),
        lastShot: performance.now(),
        active: true,
        keys: { ArrowLeft: false, ArrowRight: false, Space: false }
      };
      setScore(0);
      lastTime = performance.now();
      animFrame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
    };
  }, [state]);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square bg-bg-secondary rounded-2xl overflow-hidden border border-border shadow-card">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">Score: {score}</div>
      {state === 'idle' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-4 text-error">Asteroid Hunter</h2>
          <p className="text-text-secondary mb-8 text-center max-w-md">Defend the sector. Use left/right arrows to move and Space to fire.</p>
          <button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-nexora text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">Start Game</button>
        </div>
      )}
      {state === 'gameover' && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-base/80 z-20">
          <div className="text-2xl font-bold text-error">Sector Lost</div>
        </div>
      )}
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block" />
    </div>
  );
}
