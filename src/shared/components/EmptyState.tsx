import React from 'react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40 [&>svg]:w-full [&>svg]:h-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
