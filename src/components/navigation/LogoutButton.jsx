'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function onClick() {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success('Signed out securely.');
      router.push('/');
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <button onClick={onClick} disabled={busy} className="btn-ghost-nexora text-xs px-3 py-1.5">
      {busy ? '…' : 'Sign out'}
    </button>
  );
}
