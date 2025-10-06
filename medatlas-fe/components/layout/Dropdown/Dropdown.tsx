'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';

type Option = {
  label: string;
  value: string;
};

interface CustomDropdownProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;

  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export default function CustomDropdown({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select...',
  disabled = false,
  className,
  buttonClassName,
  menuClassName,
  optionClassName,
  renderOption,
  onOpenChange,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    if (disabled) return;
    setOpen((prev) => {
      const newState = !prev;
      onOpenChange?.(newState);
      return newState;
    });
  };

  return (
    <div className={clsx('relative', className)}>
      {label && <label className="block text-sm font-medium text-foreground">{label}</label>}

      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={clsx(
          'mt-1 flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm',
          'focus:border-primary focus:ring-1 focus:ring-primary/20 ',
          disabled
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-background text-foreground border-border',
          buttonClassName,
        )}
      >
        {options.find((opt) => opt.value === value)?.label || placeholder}
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <ul
          className={clsx(
            'absolute z-10 mt-1 w-full rounded-lg border bg-card shadow-card max-h-48 overflow-y-auto',
            'border-border',
            menuClassName,
          )}
        >
          {options.map((option) => {
            const isSelected = value === option.value;
            return (
              <li
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  onOpenChange?.(false);
                }}
                className={clsx(
                  'cursor-pointer px-3 py-2 text-sm hover:bg-primary/10',
                  isSelected && 'bg-primary/10 font-medium text-primary',
                  optionClassName,
                )}
              >
                {renderOption ? renderOption(option, isSelected) : option.label}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="text-destructive text-sm mt-1">{error}</p>}
    </div>
  );
}
