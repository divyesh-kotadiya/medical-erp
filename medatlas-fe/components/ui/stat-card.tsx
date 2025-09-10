import { cn } from '@/lib/utils';
import React from 'react';

type StatCardProps = {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  helper?: React.ReactNode;
};

export function StatCard({ label, value, icon, helper, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-gradient-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-2',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {helper && <div className="text-sm text-muted-foreground">{helper}</div>}
    </div>
  );
}

export default StatCard;

