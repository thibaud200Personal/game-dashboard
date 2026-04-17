// src/__tests__/flows/StatsPages.flow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsPage from '@/features/stats/StatsPage';
import { renderPage } from '@/shared/__tests__/utils/test-utils';

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

describe('StatsPage — affichage', () => {
  it('affiche les stats joueurs (Alice visible dans onglet Players)', async () => {
    renderPage(<StatsPage />, '/stats');
    // L'onglet "Player Stats" est actif par défaut, Alice apparaît dans Top Players
    // getAllByText car Alice peut apparaître plusieurs fois (top players + stats cards)
    await waitFor(() => {
      const alices = screen.getAllByText('Alice');
      expect(alices.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('affiche les stats jeux (Wingspan visible dans onglet Game Stats)', async () => {
    renderPage(<StatsPage />, '/stats');
    // Cliquer sur l'onglet "Game Stats" pour afficher GameStatsPage
    const gameTab = await screen.findByRole('button', { name: /game stats/i });
    await userEvent.click(gameTab);
    // Wingspan apparaît dans la liste "Select a Game for Detailed Stats"
    await waitFor(() => {
      const wingspans = screen.getAllByText('Wingspan');
      expect(wingspans.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('rend sans crash', () => {
    expect(() => renderPage(<StatsPage />, '/stats')).not.toThrow();
  });
});
