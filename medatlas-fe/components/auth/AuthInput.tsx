'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, isPassword = false, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="relative">
          <input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : props.type}
            className={`
              w-full p-3 border border-input rounded-lg bg-background 
              focus:ring-2 focus:ring-primary/20 focus:border-primary 
              focus:outline-none transition-medical
              placeholder:text-muted-foreground
              ${error ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : ''}
              ${className}
            `}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

AuthInput.displayName = 'AuthInput';
