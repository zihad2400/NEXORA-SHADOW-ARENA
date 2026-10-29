'use client';
import { useEffect, useRef, useState } from 'react';
import { triggerGameOver } from '@/utils/gameEvents';

export default function ReflexDash() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const gameRef = useRef({ player: { x: 200, y: 350, w: 20, h: 20, speed: 8 }, lasers: [], lastSpawn: 0, active: false, keys: { Left: false, Right: false } });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 400, H = 400;
    let animFrame;
    let lastTime = performance.now();

    function loop(time) {
      if (!gameRef.current.active) return;
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;
      const g = gameRef.current;

      if (g.keys.Left) g.player.x -= g.player.speed * dt;
      if (g.keys.Right) g.player.x += g.player.speed * dt;
      g.player.x = Math.max(0, Math.min(W - g.player.w, g.player.x));

      if (time - g.lastSpawn > 1000) {
        const gap = 90; const gapPos = Math.random() * (W - gap);
        g.lasers.push({ y: -20, speed: 4, gapStart: gapPos, gapEnd: gapPos + gap });
        g.lastSpawn = time; setScore(s => s + 10);
      }

      for (let i = g.lasers.length - 1; i >= 0; i--) {
        const l = g.lasers[i]; l.y += l.speed * dt;
        if (g.player.y < l.y + 15 && g.player.y + g.player.h > l.y && (g.player.x < l.gapStart || g.player.x + g.player.w > l.gapEnd)) {
          g.active = false; setState('gameover'); triggerGameOver(score, {}); return;
        }
        if (l.y > H) g.lasers.splice(i, 1);
      }

      ctx.fillStyle = '#0D1120'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#FB7185';
      g.lasers.forEach(l => { ctx.fillRect(0, l.y, l.gapStart, 15); ctx.fillRect(l.gapEnd, l.y, W - l.gapEnd, 15); });
      ctx.fillStyle = '#22D3EE'; ctx.fillRect(g.player.x, g.player.y, g.player.w, g.player.h);
      animFrame = requestAnimationFrame(loop);
    }

    function handleKeyDown(e) { if (e.key === 'ArrowLeft' || e.key === 'a') gameRef.current.keys.Left = true; if (e.key === 'ArrowRight' || e.key === 'd') gameRef.current.keys.Right = true; }
    function handleKeyUp(e) { if (e.key === 'ArrowLeft' || e.key === 'a') gameRef.current.keys.Left = false; if (e.key === 'ArrowRight' || e.key === 'd') gameRef.current.keys.Right = false; }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (state === 'playing') {
      gameRef.current = { player: { x: 200, y: 350, w: 20, h: 20, speed: 8 }, lasers: [], lastSpawn: performance.now(), active: true, keys: { Left: false, Right: false } };
      setScore(0); lastTime = performance.now(); animFrame = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [state]);

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square bg-bg-secondary rounded-2xl overflow-hidden border border-border">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">Dodge: {score}</div>
      {state === 'idle' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20"><h2 className="text-2xl font-bold mb-4 text-error">Reflex Dash</h2><button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-nexora">Start Game</button></div>}
      {state === 'gameover' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20"><div className="text-2xl font-bold text-error mb-4">Hit!</div><button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-ghost-nexora">Try Again</button></div>}
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block" />
    </div>
  );
}
