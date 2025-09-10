import { cn } from '@/lib/utils';
import React from 'react';

type SectionProps = React.PropsWithChildren<{
  className?: string;
}>;

export function Section({ className, children }: SectionProps) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground rounded-lg shadow-card border border-border',
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Section;

