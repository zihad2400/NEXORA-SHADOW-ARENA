import Link from 'next/link';

export default function Logo({ size = 'md' }) {
  const s = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg md:text-xl';
  const iconSize = size === 'lg' ? 32 : size === 'sm' ? 20 : 24;

  return (
    <Link href="/" className="inline-flex items-center gap-2 group">
      <svg width={iconSize} height={iconSize} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8B5CF6"/>
            <stop offset="1" stopColor="#22D3EE"/>
          </linearGradient>
        </defs>
        <path d="M4 28 L16 4 L28 28 L22 28 L16 16 L10 28 Z" fill="url(#lg1)"/>
      </svg>
      <span className={`font-display font-bold ${s} tracking-wider text-gradient`}>NEXORA</span>
    </Link>
  );
}
