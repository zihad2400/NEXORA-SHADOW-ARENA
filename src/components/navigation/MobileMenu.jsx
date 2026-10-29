'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

const LINKS = [
  { href: '/games', label: 'Games' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/challenges', label: 'Challenges' },
];

export default function MobileMenu({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Wait for client-side mount to use portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-text-primary z-[60] relative"
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>

      {/* Portal to render menu at the root level */}
      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 top-[60px] bg-bg-base z-[9999] flex flex-col p-6 overflow-y-auto animate-fade-up">
          <div className="flex flex-col gap-2">
            {LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold transition ${
                    isActive ? 'bg-violet/20 text-violet-soft' : 'text-text-secondary hover:bg-bg-elevated'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 border-t border-border pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-lg">
                    {user.avatar === 'default' ? user.username.charAt(0).toUpperCase() : user.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{user.username}</div>
                    <div className="text-xs text-text-secondary">Level {user.level}</div>
                  </div>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsOpen(false)} className="text-sm font-bold text-violet-soft px-4 py-2">⚡ Admin Panel</Link>
                )}
                <Link href="/settings" onClick={() => setIsOpen(false)} className="text-sm text-text-secondary px-4 py-2">Settings</Link>
                <div className="px-4"><LogoutButton /></div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsOpen(false)} className="btn-ghost-nexora w-full">Sign in</Link>
                <Link href="/register" onClick={() => setIsOpen(false)} className="btn-nexora w-full">Play Now</Link>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
