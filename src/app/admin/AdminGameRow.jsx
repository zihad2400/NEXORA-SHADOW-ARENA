'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminGameRow({ game }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/games/${game._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !game.published }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success(game.published ? 'Game Unpublished' : 'Game Published');
      router.refresh();
    } catch (err) {
      toast.error('Error updating game');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-t border-border hover:bg-bg-elevated/30">
      <td className="px-4 py-3 font-medium">{game.name}</td>
      <td className="px-4 py-3 text-text-secondary">{game.category}</td>
      <td className="px-4 py-3 text-center">
        <span className={`badge-nexora text-xs ${game.published ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
          {game.published ? 'Live' : 'Draft'}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button 
          onClick={togglePublish} 
          disabled={busy}
          className="btn-ghost-nexora text-xs px-3 py-1"
        >
          {game.published ? 'Unpublish' : 'Publish'}
        </button>
      </td>
    </tr>
  );
}
