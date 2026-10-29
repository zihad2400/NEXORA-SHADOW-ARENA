'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AVATARS = ['default', '👾', '🐉', '😈', '🥷', '🤖', '👽', '🤠'];

export default function SettingsForm({ user }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'default');
  
  // Delete modal state
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    
    const form = new FormData(e.target);
    const payload = {
      username: form.get('username'),
      avatar: selectedAvatar,
      settings: {
        soundEnabled: form.get('soundEnabled') === 'on',
        reducedMotion: form.get('reducedMotion') === 'on',
        profilePublic: form.get('profilePublic') === 'on',
      }
    };

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error?.message || 'Update failed');
      
      toast.success('Settings saved successfully.');
      router.refresh();
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'DELETE') {
      return toast.error('Please type DELETE to confirm');
    }
    setDeleting(true);
    const loadToast = toast.loading('Deleting account...');

    try {
      const res = await fetch('/api/users/me', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');

      toast.success('Account deleted. Goodbye!', { id: loadToast });
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error(err.message, { id: loadToast });
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Profile */}
        <div className="surface p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg border-b border-border pb-2">Profile</h2>
          
          <div>
            <label className="block text-sm mb-2">Avatar</label>
            <div className="flex flex-wrap gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setSelectedAvatar(a)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                    selectedAvatar === a 
                      ? 'bg-violet text-text-primary shadow-glow-violet scale-110 border-2 border-violet-soft' 
                      : 'bg-bg-elevated text-text-secondary hover:bg-bg-card border border-border'
                  }`}
                >
                  {a === 'default' ? user.username.charAt(0).toUpperCase() : a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm mb-1">Username</label>
            <input id="username" name="username" defaultValue={user.username} required className="input-nexora" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email (cannot be changed)</label>
            <input value={user.email} disabled className="input-nexora opacity-50 cursor-not-allowed" />
          </div>
        </div>

        {/* Gaming & Privacy Settings */}
        <div className="surface p-6 space-y-4">
          <h2 className="font-display font-semibold text-lg border-b border-border pb-2">Game Settings</h2>
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-bg-elevated transition">
            <input type="checkbox" name="soundEnabled" defaultChecked={user.settings?.soundEnabled} className="checkbox checkbox-primary" />
            <div>
              <div className="text-sm font-medium">Enable Sound Effects</div>
              <div className="text-xs text-text-secondary">Play synthwave BGM and UI clicks.</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-bg-elevated transition">
            <input type="checkbox" name="reducedMotion" defaultChecked={user.settings?.reducedMotion} className="checkbox checkbox-primary" />
            <div>
              <div className="text-sm font-medium">Reduce Motion</div>
              <div className="text-xs text-text-secondary">Minimize animations and screen shake.</div>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-bg-elevated transition">
            <input type="checkbox" name="profilePublic" defaultChecked={user.settings?.profilePublic} className="checkbox checkbox-primary" />
            <div>
              <div className="text-sm font-medium">Public Profile</div>
              <div className="text-xs text-text-secondary">Allow others to see your stats on leaderboards.</div>
            </div>
          </label>
        </div>

        {error && <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg p-3">{error}</div>}

        <button type="submit" disabled={busy} className="btn-nexora w-full py-3">
          {busy ? 'Saving Settings...' : 'Save Settings'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="surface p-6 border-error/30 bg-error/5">
        <h2 className="font-display font-semibold text-lg text-error border-b border-error/20 pb-2 mb-4">Danger Zone</h2>
        <p className="text-sm text-text-secondary mb-4">
          Once you delete your account, there is no going back. All your scores, XP, coins, and achievements will be permanently wiped from the database.
        </p>
        
        {!showDelete ? (
          <button onClick={() => setShowDelete(true)} className="px-6 py-2 rounded-xl text-sm font-semibold border border-error text-error hover:bg-error hover:text-bg-base transition-all">
            Delete Account
          </button>
        ) : (
          <div className="space-y-3 p-4 bg-bg-base/50 rounded-xl border border-error/30 animate-fade-up">
            <p className="text-sm font-medium text-error">Type <span className="font-mono bg-error/20 px-1 rounded">DELETE</span> to confirm.</p>
            <input 
              type="text" 
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="input-nexora border-error/50 focus:border-error focus:ring-error w-full max-w-sm"
            />
            <div className="flex gap-2">
              <button 
                onClick={handleDeleteAccount} 
                disabled={deleting || deleteConfirm !== 'DELETE'} 
                className="px-6 py-2 rounded-xl text-sm font-semibold bg-error text-bg-base disabled:opacity-50 transition-all"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
              <button onClick={() => setShowDelete(false)} className="btn-ghost-nexora px-6 py-2 text-sm">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
