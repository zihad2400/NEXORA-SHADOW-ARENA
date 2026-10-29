'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ClaimButton({ challengeId, isComplete, isClaimed }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClaim() {
    if (!isComplete || isClaimed || busy) return;
    setBusy(true);
    const loadToast = toast.loading('Claiming reward...');

    try {
      const res = await fetch('/api/challenges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || 'Failed to claim');

      toast.success('Reward claimed successfully!', { id: loadToast });
      router.refresh(); // Refresh server data
    } catch (err) {
      toast.error(err.message, { id: loadToast });
    } finally {
      setBusy(false);
    }
  }

  if (isClaimed) {
    return (
      <button disabled className="px-6 py-2 rounded-xl text-sm font-semibold bg-bg-elevated text-text-secondary border border-border cursor-not-allowed opacity-70">
        ✓ Claimed
      </button>
    );
  }

  return (
    <button 
      onClick={handleClaim} 
      disabled={!isComplete || busy} 
      className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${
        isComplete 
          ? 'btn-nexora shadow-glow-violet' 
          : 'bg-bg-elevated text-text-secondary border border-border cursor-not-allowed opacity-70 hover:bg-bg-elevated'
      }`}
    >
      {busy ? 'Claiming...' : isComplete ? 'Claim Reward' : 'In Progress'}
    </button>
  );
}
