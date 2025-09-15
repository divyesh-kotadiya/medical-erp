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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={clsx(
          'w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent',
          error && 'border-red-500',
          className
        )}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
