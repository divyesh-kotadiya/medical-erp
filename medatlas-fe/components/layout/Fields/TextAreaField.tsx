'use client';

import clsx from 'clsx';

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function TextAreaField({ label, error, className, ...props }: TextAreaFieldProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <textarea
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
