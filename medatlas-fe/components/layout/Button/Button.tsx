'use client';

import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all shadow-sm';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-card',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
    danger:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive shadow-card',
    outline: 'border border-border bg-background hover:bg-muted text-foreground focus:ring-primary',
    ghost: 'hover:bg-muted text-foreground focus:ring-primary',
  };

  return (
    <button
      {...props}
      className={clsx(
        baseStyles,
        sizes[size],
        variants[variant],
        className,
        props.disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
    >
      {children}
    </button>
  );
}
