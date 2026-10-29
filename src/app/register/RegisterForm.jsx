'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterForm({ callbackUrl }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(e.target);
    const payload = {
      username: form.get('username'),
      email: form.get('email'),
      password: form.get('password'),
      confirmPassword: form.get('confirmPassword'),
    };
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data?.error?.message || 'Registration failed');
        toast.error(data?.error?.message || 'Registration failed');
      } else {
        toast.success('Account created! Entering the Arena...');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError('Network error. Try again.');
      toast.error('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="surface p-6 space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm mb-1">Username</label>
        <input id="username" name="username" required minLength={3} maxLength={20} pattern="[a-zA-Z0-9_]+" title="Letters, numbers, and underscores only" className="input-nexora" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm mb-1">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input-nexora" />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm mb-1">Password</label>
        <div className="relative">
          <input 
            id="password" 
            name="password" 
            type={showPassword ? "text" : "password"} 
            required 
            minLength={8} 
            autoComplete="new-password" 
            className="input-nexora pr-10" 
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm mb-1">Confirm password</label>
        <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" className="input-nexora" />
      </div>
      
      {error && (
        <div className="bg-error/10 border border-error/30 text-error text-sm rounded-lg p-3" role="alert">
          {error}
        </div>
      )}
      
      <button type="submit" disabled={busy} className="btn-nexora w-full">
        {busy ? 'Creating account…' : 'Create account'}
      </button>
      
      <p className="text-xs text-text-secondary text-center">
        Have an account? <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-violet-soft hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
