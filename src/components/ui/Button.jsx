'use client';
import Link from 'next/link';

export default function Button({
  children, variant = 'primary', href, className = '', disabled, ...rest
}) {
  const cls = `${variant === 'ghost' ? 'btn-ghost-nexora' : 'btn-nexora'} ${className}`;
  if (href) return <Link href={href} className={cls} {...rest}>{children}</Link>;
  return <button className={cls} disabled={disabled} {...rest}>{children}</button>;
}
