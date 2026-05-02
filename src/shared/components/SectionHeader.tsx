import React from 'react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export default function SectionHeader({ icon, title, action, className }: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-3 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-primary" aria-hidden="true">{icon}</span>
        )}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
