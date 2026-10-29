'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminUserRow({ user, currentAdminId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isSelf = user._id === currentAdminId;
  const isTargetAdmin = user.role === 'admin';

  async function updateUser(action) {
    setBusy(true);
    try {
      const payload = action === 'promote' ? { role: 'admin' } : 
                      action === 'demote' ? { role: 'user' } : 
                      { status: user.status === 'active' ? 'suspended' : 'active' };
                      
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to update');
      
      toast.success('User updated');
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-t border-border hover:bg-bg-elevated/30">
      <td className="px-4 py-3 font-medium">
        {user.username}
        {isSelf && <span className="ml-2 text-xs text-text-secondary">(You)</span>}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-bold ${isTargetAdmin ? 'text-violet-soft' : 'text-text-secondary'}`}>
          {user.role.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`badge-nexora text-xs ${user.status === 'active' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
          {user.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {/* If the target user is an Admin (or self), show a protected label */}
        {(isSelf || isTargetAdmin) ? (
          <span className="text-xs text-text-secondary italic">🔒 Protected</span>
        ) : (
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => updateUser('promote')} 
              disabled={busy} 
              className="text-xs text-violet-soft hover:underline disabled:opacity-50"
            >
              Make Admin
            </button>
            <button 
              onClick={() => updateUser('suspend')} 
              disabled={busy} 
              className={`text-xs hover:underline disabled:opacity-50 ${user.status === 'active' ? 'text-error' : 'text-success'}`}
            >
              {user.status === 'active' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
