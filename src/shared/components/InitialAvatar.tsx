import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface InitialAvatarProps {
  name: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

interface PlayerAvatarProps {
  name: string;
  url?: string | null;
  className?: string;
}

export function PlayerAvatar({ name, url, className }: PlayerAvatarProps) {
  const [error, setError] = useState(false);
  const safe = Boolean(url && /^https?:\/\//.test(url) && !error);
  if (safe) {
    return (
      <img
        src={url!}
        alt=""
        className={cn('rounded-full object-cover', className)}
        onError={() => setError(true)}
      />
    );
  }
  return <InitialAvatar name={name} className={className} />;
}

export function InitialAvatar({ name, className }: InitialAvatarProps) {
  const initials = getInitials(name);
  const hue = getHue(name);
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold select-none',
        className
      )}
      style={{ backgroundColor: `hsl(${hue}, 60%, 40%)` }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
