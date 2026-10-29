import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { findUserById } from '@/services/userService';
import Logo from '@/components/ui/Logo';
import LogoutButton from './LogoutButton';
import NavLinks from './NavLinks';
import MobileMenu from './MobileMenu';

export default async function TopNav() {
  const session = await getSession();
  let user = null;
  
  if (session?.user?.id) {
    await connectDB();
    const userDoc = await findUserById(session.user.id);
    if (userDoc) user = JSON.parse(JSON.stringify(userDoc));
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border backdrop-blur-lg bg-bg-base/70">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden md:block">
            <NavLinks />
          </div>
        </div>
        
        {/* Desktop User Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-xs font-bold text-violet-soft border border-violet-soft/30 bg-violet/10 px-3 py-1.5 rounded-lg hover:bg-violet/20 transition">
                  ⚡ Admin
                </Link>
              )}
              <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-bg-elevated border border-border flex items-center justify-center text-sm">
                  {user.avatar === 'default' ? user.username.charAt(0).toUpperCase() : user.avatar}
                </div>
                <span className="text-sm font-medium">{user.username}</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost-nexora text-xs px-3 py-1.5">Sign in</Link>
              <Link href="/register" className="btn-nexora text-xs px-3 py-1.5">Play Now</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu (Client Component) */}
        <div className="md:hidden flex items-center gap-2">
          <MobileMenu user={user} />
        </div>
      </nav>
    </header>
  );
}
