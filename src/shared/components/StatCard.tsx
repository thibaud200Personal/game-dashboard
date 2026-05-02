import React from 'react';
import { cn } from '@/shared/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export default function StatCard({ icon, value, label, layout = 'vertical', className }: StatCardProps) {
  if (layout === 'horizontal') {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          <div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground">{label}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-4 text-center', className)}>
      <div className="mb-2">{icon}</div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
