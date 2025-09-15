'use client';

import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const baseStyles =
    'px-6 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors shadow-sm';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-ring',
    secondary: 'bg-warning text-white hover:bg-warning-hover',
    danger: 'bg-danger text-white hover:bg-danger-hover',
  };

  return (
    <button {...props} className={clsx(baseStyles, variants[variant], className)}>
      {children}
    </button>
  );
}
