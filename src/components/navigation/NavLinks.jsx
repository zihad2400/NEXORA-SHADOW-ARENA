'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/games', label: 'Games' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/challenges', label: 'Challenges' },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex items-center gap-1 text-sm font-medium">
      {LINKS.map((link) => {
        // Check if current path starts with the link's href (e.g., /games/neon-dodge -> highlights Games)
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isActive
                ? 'bg-violet/15 text-violet-soft shadow-[inset_0_-2px_0_0_#8B5CF6]' // Active style
                : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary' // Inactive style
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
