'use client';

import Link from 'next/link';

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function AuthLink({ href, children, className = '' }: AuthLinkProps) {
  return (
    <Link 
      href={href} 
      className={`
        text-primary hover:text-primary-hover font-medium 
        transition-colors duration-200 hover:underline
        ${className}
      `}
    >
      {children}
    </Link>
  );
}
