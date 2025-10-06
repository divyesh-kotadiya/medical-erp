import { cn } from '@/lib/utils';
import React from 'react';

type PageHeaderProps = React.PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}>;

export function PageHeader({ title, description, actions, className, children }: PageHeaderProps) {
  return (
    <div className={cn('bg-secondary text-secondary-foreground rounded-lg p-4 md:p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
          {description && (
            <p className="text-sm md:text-base text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export default PageHeader;
