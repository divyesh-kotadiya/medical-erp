'use client';

import clsx from 'clsx';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputField({ label, error, className, ...props }: InputFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={clsx(
          'w-full border border-border rounded-lg px-4 py-3 bg-background',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          error && 'border-destructive',
          className
        )}
      />
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
}