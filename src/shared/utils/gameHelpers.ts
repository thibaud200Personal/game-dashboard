import type { Game, GameCharacter } from '@/types';

// ---------------------------------------------------------------------------
// Difficulty
// ---------------------------------------------------------------------------
export function getDifficultyColor(difficulty: string): string {
  switch ((difficulty || '').toLowerCase()) {
    case 'beginner': return 'text-green-400';
    case 'intermediate': return 'text-yellow-400';
    case 'expert': return 'text-red-400';
    default: return 'text-white/60';
  }
}

// ---------------------------------------------------------------------------
// Expansions
// ---------------------------------------------------------------------------
export function formatExpansion(exp: { name: string; year_published?: number }): string {
  const year = exp.year_published && exp.year_published > 0 ? ` (${exp.year_published})` : '';
  return exp.name + year;
}

// ---------------------------------------------------------------------------
// Game card
// ---------------------------------------------------------------------------
export function getCredit(game: Game): string {
  const parts: string[] = [];
  if (game.designer !== 'Unknown') parts.push(`By ${game.designer}`);
  if (game.publisher !== 'Unknown') parts.push(game.publisher);
  return parts.join(' • ');
}

export function getGameCardStyles() {
  return {
    ghostBtn: 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10',
    meta: 'flex items-center space-x-4 text-slate-500 dark:text-white/60',
    credit: 'mt-1 text-xs text-slate-400 dark:text-white/50',
    dropdownItem: 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-white',
  };
}

// ---------------------------------------------------------------------------
// Expansion view layout
// ---------------------------------------------------------------------------
export function getContentClass(embedded: boolean): string {
  if (embedded) return '';
  return 'max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-32 md:pb-8';
}

// ---------------------------------------------------------------------------
// Stats medals
// ---------------------------------------------------------------------------
const WINNER_MEDAL_CLASSES = [
  'bg-yellow-400 text-yellow-900',
  'bg-gray-300 text-gray-900',
  'bg-amber-600 text-amber-100',
];

export function getMedalClass(index: number): string {
  return WINNER_MEDAL_CLASSES[index] ?? 'bg-primary/20 text-primary';
}

// ---------------------------------------------------------------------------
// Character abilities
// ---------------------------------------------------------------------------
export function withUpdatedAbility(
  chars: GameCharacter[],
  charIndex: number,
  abilityIndex: number,
  value: string
): GameCharacter[] {
  return chars.map((char, i) => {
    if (i !== charIndex) return char;
    return { ...char, abilities: (char.abilities || []).map((a, j) => j === abilityIndex ? value : a) };
  });
}

export function withRemovedAbility(
  chars: GameCharacter[],
  charIndex: number,
  abilityIndex: number
): GameCharacter[] {
  return chars.map((char, i) => {
    if (i !== charIndex) return char;
    return { ...char, abilities: (char.abilities || []).filter((_, j) => j !== abilityIndex) };
  });
}
