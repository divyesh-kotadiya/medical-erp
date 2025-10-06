'use client';

import { TriangleAlert } from 'lucide-react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  error?: string;
}

export default function Checkbox({ label, checked, onChange, error }: CheckboxProps) {
  return (
    <div>
      <label
        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
          checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 text-primary border-border rounded focus:ring-primary/20"
        />
        <span className="text-sm text-foreground">{label}</span>
      </label>

      {error && (
        <p className="mt-2 text-sm text-destructive flex items-center gap-1">
          <TriangleAlert className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
