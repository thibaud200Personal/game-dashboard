import React from 'react';
import { cn } from '@/shared/lib/utils';

interface PageHeaderProps {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, left, right, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="w-10 flex justify-start">{left}</div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <div className="w-10 flex justify-end" aria-hidden={!right}>
        {right}
      </div>
    </div>
  );
}
