export type GameMode = 'competitive' | 'cooperative' | 'campaign' | 'hybrid';

export const gameModeColors: Record<GameMode, {
  badge: string;
  dot: string;
}> = {
  competitive: { badge: 'border-red-400/30 text-red-400',    dot: 'bg-red-400' },
  cooperative: { badge: 'border-blue-400/30 text-blue-400',  dot: 'bg-blue-400' },
  campaign:    { badge: 'border-purple-400/30 text-purple-400', dot: 'bg-purple-400' },
  hybrid:      { badge: 'border-orange-400/30 text-orange-400', dot: 'bg-orange-400' },
};

export const gameModeFallback = { badge: 'border-gray-400/30 text-gray-400', dot: 'bg-gray-400' };
