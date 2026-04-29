import { describe, it, expect } from 'vitest';
import {
  getDifficultyColor,
  formatExpansion,
  getCredit,
  getGameCardStyles,
  getContentClass,
  getMedalClass,
  withUpdatedAbility,
  withRemovedAbility,
} from '@/shared/utils/gameHelpers';
import type { Game, GameCharacter, GameExpansion } from '@/types';

// Minimal Game stub for getCredit tests
const makeGame = (designer: string, publisher: string): Game =>
  ({ designer, publisher } as Game);

// Minimal GameCharacter stub
const makeChar = (name: string, abilities: string[]): GameCharacter =>
  ({ character_key: name, name, abilities } as GameCharacter);

// Minimal GameExpansion stub
const makeExpansion = (name: string, year_published?: number): GameExpansion =>
  ({ expansion_id: 1, game_id: 1, name, year_published } as GameExpansion);

// ---------------------------------------------------------------------------
// getDifficultyColor
// ---------------------------------------------------------------------------
describe('getDifficultyColor', () => {
  it('returns green for beginner', () => {
    expect(getDifficultyColor('beginner')).toBe('text-green-400');
  });

  it('is case-insensitive', () => {
    expect(getDifficultyColor('Beginner')).toBe('text-green-400');
    expect(getDifficultyColor('INTERMEDIATE')).toBe('text-yellow-400');
  });

  it('returns yellow for intermediate', () => {
    expect(getDifficultyColor('intermediate')).toBe('text-yellow-400');
  });

  it('returns red for expert', () => {
    expect(getDifficultyColor('expert')).toBe('text-red-400');
  });

  it('returns fallback for unknown difficulty', () => {
    expect(getDifficultyColor('unknown')).toBe('text-white/60');
    expect(getDifficultyColor('')).toBe('text-white/60');
  });
});

// ---------------------------------------------------------------------------
// formatExpansion
// ---------------------------------------------------------------------------
describe('formatExpansion', () => {
  it('includes year when positive', () => {
    expect(formatExpansion({ name: 'Promos', year_published: 2022 })).toBe('Promos (2022)');
  });

  it('omits year when 0', () => {
    expect(formatExpansion({ name: 'Promos', year_published: 0 })).toBe('Promos');
  });

  it('omits year when undefined', () => {
    expect(formatExpansion({ name: 'Promos' })).toBe('Promos');
  });
});

// ---------------------------------------------------------------------------
// formatExpansion with GameExpansion type
// ---------------------------------------------------------------------------
describe('formatExpansion (GameExpansion)', () => {
  it('includes year when positive', () => {
    expect(formatExpansion(makeExpansion('Jaws of the Lion', 2020))).toBe('Jaws of the Lion (2020)');
  });

  it('omits year when 0', () => {
    expect(formatExpansion(makeExpansion('Jaws of the Lion', 0))).toBe('Jaws of the Lion');
  });

  it('omits year when undefined', () => {
    expect(formatExpansion(makeExpansion('Jaws of the Lion'))).toBe('Jaws of the Lion');
  });
});

// ---------------------------------------------------------------------------
// getCredit
// ---------------------------------------------------------------------------
describe('getCredit', () => {
  it('shows designer and publisher when both known', () => {
    expect(getCredit(makeGame('Isaac Childres', 'Cephalofair'))).toBe('By Isaac Childres • Cephalofair');
  });

  it('omits designer when Unknown', () => {
    expect(getCredit(makeGame('Unknown', 'Cephalofair'))).toBe('Cephalofair');
  });

  it('omits publisher when Unknown', () => {
    expect(getCredit(makeGame('Isaac Childres', 'Unknown'))).toBe('By Isaac Childres');
  });

  it('returns empty string when both Unknown', () => {
    expect(getCredit(makeGame('Unknown', 'Unknown'))).toBe('');
  });
});

// ---------------------------------------------------------------------------
// getGameCardStyles
// ---------------------------------------------------------------------------
describe('getGameCardStyles', () => {
  it('contains dark Tailwind classes', () => {
    const styles = getGameCardStyles();
    expect(styles.ghostBtn).toContain('dark:text-white');
    expect(styles.meta).toContain('dark:text-white/60');
    expect(styles.credit).toContain('dark:text-white/50');
    expect(styles.dropdownItem).toContain('dark:text-white');
  });

  it('contains light Tailwind classes', () => {
    const styles = getGameCardStyles();
    expect(styles.ghostBtn).toContain('text-slate-600');
    expect(styles.meta).toContain('text-slate-500');
    expect(styles.credit).toContain('text-slate-400');
    expect(styles.dropdownItem).toContain('text-slate-700');
  });

  it('returns all four keys', () => {
    const keys = Object.keys(getGameCardStyles());
    expect(keys).toEqual(expect.arrayContaining(['ghostBtn', 'meta', 'credit', 'dropdownItem']));
  });
});

// ---------------------------------------------------------------------------
// withUpdatedAbility
// ---------------------------------------------------------------------------
describe('withUpdatedAbility', () => {
  const chars = [
    makeChar('Brute', ['Move', 'Attack']),
    makeChar('Scoundrel', ['Backstab']),
  ];

  it('updates the correct ability', () => {
    const result = withUpdatedAbility(chars, 0, 1, 'Jump');
    expect(result[0].abilities).toEqual(['Move', 'Jump']);
  });

  it('does not mutate other characters', () => {
    const result = withUpdatedAbility(chars, 0, 0, 'Loot');
    expect(result[1].abilities).toEqual(['Backstab']);
  });

  it('does not mutate the original array', () => {
    withUpdatedAbility(chars, 0, 0, 'X');
    expect(chars[0].abilities).toEqual(['Move', 'Attack']);
  });

  it('handles missing abilities array gracefully', () => {
    const noAbilities = [makeChar('Empty', undefined as unknown as string[])];
    const result = withUpdatedAbility(noAbilities, 0, 0, 'Skill');
    expect(result[0].abilities).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// withRemovedAbility
// ---------------------------------------------------------------------------
describe('withRemovedAbility', () => {
  const chars = [
    makeChar('Brute', ['Move', 'Attack', 'Jump']),
    makeChar('Scoundrel', ['Backstab']),
  ];

  it('removes the correct ability', () => {
    const result = withRemovedAbility(chars, 0, 1);
    expect(result[0].abilities).toEqual(['Move', 'Jump']);
  });

  it('does not mutate other characters', () => {
    const result = withRemovedAbility(chars, 0, 0);
    expect(result[1].abilities).toEqual(['Backstab']);
  });

  it('does not mutate the original array', () => {
    withRemovedAbility(chars, 0, 0);
    expect(chars[0].abilities).toEqual(['Move', 'Attack', 'Jump']);
  });
});

// ---------------------------------------------------------------------------
// getContentClass
// ---------------------------------------------------------------------------
describe('getContentClass', () => {
  it('returns empty string when embedded', () => {
    expect(getContentClass(true)).toBe('');
  });

  it('returns base layout class when not embedded', () => {
    const result = getContentClass(false);
    expect(result).toContain('max-w-7xl');
  });
});

// ---------------------------------------------------------------------------
// getMedalClass
// ---------------------------------------------------------------------------
describe('getMedalClass', () => {
  it('returns gold for index 0', () => {
    expect(getMedalClass(0)).toContain('yellow');
  });

  it('returns silver for index 1', () => {
    expect(getMedalClass(1)).toContain('gray');
  });

  it('returns bronze for index 2', () => {
    expect(getMedalClass(2)).toContain('amber');
  });

  it('returns default class for out-of-range index', () => {
    expect(getMedalClass(5)).toBe('bg-primary/20 text-primary');
  });
});
