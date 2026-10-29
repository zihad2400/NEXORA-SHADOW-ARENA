import Link from 'next/link';
import Logo from '@/components/ui/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-6 text-sm text-text-secondary">
        <div>
          <Logo size="sm" />
          <p className="mt-2 max-w-xs">Enter the dark. Master the arena.</p>
        </div>
        <div className="flex gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-text-primary font-semibold mb-1">Play</div>
            <Link href="/games" className="hover:text-text-primary">Games</Link>
            <Link href="/leaderboard" className="hover:text-text-primary">Leaderboard</Link>
            <Link href="/challenges" className="hover:text-text-primary">Challenges</Link>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-text-primary font-semibold mb-1">Account</div>
            <Link href="/login" className="hover:text-text-primary">Sign in</Link>
            <Link href="/register" className="hover:text-text-primary">Register</Link>
            <Link href="/settings" className="hover:text-text-primary">Settings</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-text-secondary">
        © NEXORA · Shadow Arena · Local build
      </div>
    </footer>
  );
}
