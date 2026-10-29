'use client';
import { useEffect, useRef, useState } from 'react';
import { triggerGameOver } from '@/utils/gameEvents';

export default function TowerStack() {
  const canvasRef = useRef(null);
  const [state, setState] = useState('idle');
  const [score, setScore] = useState(0);
  const gameRef = useRef({ blocks: [], currentBlock: null, active: false, movingRight: true });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 400, H = 500, BH = 30;
    let animFrame;

    function loop() {
      if (!gameRef.current.active) return;
      const g = gameRef.current;
      if (g.currentBlock) {
        g.currentBlock.x += g.movingRight ? 4 : -4;
        if (g.currentBlock.x + g.currentBlock.w > W) g.movingRight = false;
        if (g.currentBlock.x < 0) g.movingRight = true;
      }
      ctx.fillStyle = '#0D1120'; ctx.fillRect(0, 0, W, H);
      g.blocks.forEach(b => { ctx.fillStyle = '#8B5CF6'; ctx.fillRect(b.x, b.y, b.w, BH); });
      if (g.currentBlock) { ctx.fillStyle = '#22D3EE'; ctx.fillRect(g.currentBlock.x, g.currentBlock.y, g.currentBlock.w, BH); }
      animFrame = requestAnimationFrame(loop);
    }

    function dropBlock() {
      const g = gameRef.current;
      if (!g.active || !g.currentBlock) return;
      const prev = g.blocks[g.blocks.length - 1];
      if (!prev) return;
      const left = Math.max(g.currentBlock.x, prev.x);
      const right = Math.min(g.currentBlock.x + g.currentBlock.w, prev.x + prev.w);
      const width = right - left;

      if (width <= 0) { g.active = false; setState('gameover'); triggerGameOver(g.blocks.length - 1, {}); return; }
      g.blocks.push({ x: left, y: g.currentBlock.y, w: width });
      setScore(s => s + 10);
      
      const nextY = g.currentBlock.y - BH;
      if (nextY < 0) { g.active = false; setState('gameover'); triggerGameOver(g.blocks.length * 20, {}); return; }
      
      g.currentBlock = { x: 0, y: nextY, w: prev.w };
      g.movingRight = true;
    }

    const handleKey = (e) => { if (e.code === 'Space') dropBlock(); };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', dropBlock);

    if (state === 'playing') {
      gameRef.current = { blocks: [{ x: W/2 - 50, y: H - BH, w: 100 }], currentBlock: { x: 0, y: H - BH * 2, w: 100 }, active: true, movingRight: true };
      setScore(0); animFrame = requestAnimationFrame(loop);
    }
    return () => { cancelAnimationFrame(animFrame); window.removeEventListener('keydown', handleKey); window.removeEventListener('mousedown', dropBlock); };
  }, [state]);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[4/5] bg-bg-secondary rounded-2xl overflow-hidden border border-border">
      <div className="absolute top-4 left-4 z-10 font-mono text-cyan text-xl font-bold">Height: {score}</div>
      {state === 'idle' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20"><h2 className="text-2xl font-bold mb-4">Tower Stack</h2><button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-nexora">Start Game</button></div>}
      {state === 'gameover' && <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-base/80 z-20"><div className="text-2xl font-bold text-error mb-4">Tower Fell</div><button onClick={() => (window.dispatchEvent(new Event('nexora:gamestart')), (window.dispatchEvent(new Event('nexora:gamestart')), setState('playing')))} className="btn-ghost-nexora">Try Again</button></div>}
      <canvas ref={canvasRef} width={400} height={500} className="w-full h-full block" />
    </div>
  );
}
