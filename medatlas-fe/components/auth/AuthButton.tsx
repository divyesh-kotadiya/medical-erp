'use client';

import { Button } from '@/components/ui/button';
import { Loading } from '../loading';
interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function AuthButton({
  children,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}: AuthButtonProps) {
  return (
    <Button
      type={type}
      onClick={onClick}
      className={`
        w-full bg-gradient-primary hover:opacity-90 text-white 
        py-3 rounded-lg transition-medical transform shadow-card 
        hover:shadow-elevated disabled:opacity-70 disabled:cursor-not-allowed
        disabled:transform-none hover:scale-[1.02] active:scale-[0.98]
        ${className}
      `}
      disabled={loading || disabled}
    >
      {loading ? (
        <div className="flex items-center gap-2 justify-center">
          <Loading />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
