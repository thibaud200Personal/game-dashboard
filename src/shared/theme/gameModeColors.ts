export type GameMode = 'competitive' | 'cooperative' | 'campaign' | 'hybrid';

export const gameModeColors: Record<GameMode, {
  badge: string;
  dot: string;
  icon: string;
  bg: string;
  gradient: string;
}> = {
  competitive: {
    badge:    'border-red-400/30 text-red-400',
    dot:      'bg-red-400',
    icon:     'text-red-400',
    bg:       'bg-red-500/20 text-red-300',
    gradient: 'from-red-400 to-red-600',
  },
  cooperative: {
    badge:    'border-blue-400/30 text-blue-400',
    dot:      'bg-blue-400',
    icon:     'text-blue-400',
    bg:       'bg-blue-500/20 text-blue-300',
    gradient: 'from-blue-400 to-blue-600',
  },
  campaign: {
    badge:    'border-purple-400/30 text-purple-400',
    dot:      'bg-purple-400',
    icon:     'text-purple-400',
    bg:       'bg-purple-500/20 text-purple-300',
    gradient: 'from-purple-400 to-purple-600',
  },
  hybrid: {
    badge:    'border-orange-400/30 text-orange-400',
    dot:      'bg-orange-400',
    icon:     'text-orange-400',
    bg:       'bg-orange-500/20 text-orange-300',
    gradient: 'from-orange-400 to-orange-600',
  },
};

export const gameModeFallback = {
  badge:    'border-gray-400/30 text-gray-400',
  dot:      'bg-gray-400',
  icon:     'text-gray-400',
  bg:       'bg-gray-500/20 text-gray-300',
  gradient: 'from-gray-400 to-gray-600',
};
