'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { soundEngine } from '@/utils/soundEngine';
import MobileGameControls from './MobileGameControls';

export default function GameShell({ game, children }) {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    fetch('/api/game-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameSlug: game.slug }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) throw new Error(data.error?.message || 'Failed to start');
        setSessionId(data.sessionId);
        setStartedAt(Date.now());
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        toast.error('Failed to initialize arena.');
        setLoading(false);
      });
  }, [game.slug]);

  // Prevent page scrolling when pressing Arrow Keys or Space on PC
  useEffect(() => {
    const preventScroll = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', preventScroll, { passive: false });
    return () => window.removeEventListener('keydown', preventScroll);
  }, []);

  useEffect(() => {
    const handleGameStart = () => {
      soundEngine.playStart();
      setTimeout(() => soundEngine.startBGM(), 500); 
    };

    const handleGameOver = async (e) => {
      soundEngine.playGameOver();
      const { score, metrics } = e.detail;
      if (!sessionId || !startedAt) return;
      
      setSaving(true);
      const durationMs = Date.now() - startedAt;
      const loadToast = toast.loading('Saving match results...');

      try {
        const res = await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, gameSlug: game.slug, score, durationMs, metrics }),
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error?.message || 'Failed to save');

        setResult({
          score,
          xpGained: 10 + Math.min(50, Math.floor(score / 20)),
          coinsGained: 5,
        });
        
        toast.success(`Match Complete! +${10 + Math.min(50, Math.floor(score / 20))} XP`, { id: loadToast });
        router.refresh();
      } catch (err) {
        setResult({ error: err.message, score });
        toast.error('Failed to save match.', { id: loadToast });
      } finally {
        setSaving(false);
      }
    };

    window.addEventListener('nexora:gamestart', handleGameStart);
    window.addEventListener('nexora:gameover', handleGameOver);
    
    return () => {
      window.removeEventListener('nexora:gamestart', handleGameStart);
      window.removeEventListener('nexora:gameover', handleGameOver);
      soundEngine.stopBGM();
    };
  }, [sessionId, startedAt, game.slug, router]);

  const handleMuteToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  if (error) {
    return (
      <div className="surface-elevated p-6 sm:p-8 text-center">
        <div className="text-error mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="btn-nexora">Retry</button>
      </div>
    );
  }

  if (loading) {
    return <div className="p-12 text-center text-text-secondary animate-pulse">Preparing arena...</div>;
  }

  if (result) {
    return (
      <div className="surface-elevated p-6 sm:p-8 text-center max-w-md mx-auto animate-fade-up">
        <h2 className="font-display text-2xl font-bold mb-2">Match Complete</h2>
        <div className="text-4xl sm:text-5xl font-mono text-cyan mb-4">{result.score}</div>
        
        {result.error ? (
          <p className="text-error text-sm mb-4">Save failed: {result.error}</p>
        ) : (
          <div className="flex justify-center gap-4 text-sm mb-6 text-text-secondary">
            <span className="badge-nexora">+{result.xpGained} XP</span>
            <span className="badge-nexora text-warning">+{result.coinsGained} Coins</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="btn-ghost-nexora w-full sm:w-auto">Dashboard</Link>
          <button onClick={() => window.location.reload()} className="btn-nexora w-full sm:w-auto">Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <MobileGameControls />

      {/* Responsive Header with PC & Mobile Controls Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 bg-bg-elevated/50 p-3 rounded-xl border border-border">
        
        {/* PC Controls Info */}
        <div className="hidden md:flex gap-2 text-xs text-text-secondary">
          <span className="bg-bg-elevated px-3 py-1.5 rounded-lg border border-border font-medium flex items-center gap-1.5">
            ⌨️ Arrow Keys / WASD
          </span>
          <span className="bg-bg-elevated px-3 py-1.5 rounded-lg border border-border font-medium flex items-center gap-1.5">
            🖱️ Mouse Move / Click
          </span>
          <span className="bg-bg-elevated px-3 py-1.5 rounded-lg border border-border font-medium flex items-center gap-1.5">
            ␣ Space Bar
          </span>
        </div>

        {/* Mobile Controls Info */}
        <div className="flex md:hidden flex-wrap gap-2 text-xs text-text-secondary">
          <span className="bg-bg-elevated px-3 py-1.5 rounded-lg border border-border">👆 Swipe to Move</span>
          <span className="bg-bg-elevated px-3 py-1.5 rounded-lg border border-border">👆 Tap to Action</span>
        </div>

        <div className="sm:ml-auto w-full sm:w-auto flex justify-end">
          <button 
            onClick={handleMuteToggle} 
            className="text-text-secondary hover:text-text-primary text-sm flex items-center gap-1 transition-colors bg-bg-elevated px-3 py-1.5 rounded-lg border border-border w-full sm:w-auto justify-center"
          >
            {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </div>
      </div>

      {saving && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg-base/80 backdrop-blur-sm rounded-2xl">
          <div className="text-text-secondary animate-pulse">Saving result...</div>
        </div>
      )}
      
      <div className="w-full max-w-full overflow-hidden flex justify-center touch-none px-1 outline-none" tabIndex={0}>
        {children}
      </div>
    </div>
  );
}
