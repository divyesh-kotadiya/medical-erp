'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Option = {
  label: string;
  value: string;
};

interface CustomDropdownProps {
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function CustomDropdown({
  label,
  options,
  value,
  onChange,
  error,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-1 flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
      >
        {value || `Select ${label}`}
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-lg border bg-white shadow-md max-h-48 overflow-y-auto">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 ${
                value === option.value ? 'bg-blue-100 font-medium' : ''
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
