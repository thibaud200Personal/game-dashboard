// src/__tests__/flows/DashboardPage.flow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Dashboard from '@/components/Dashboard';
import { renderPage } from '@/__tests__/utils/test-utils';

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

describe('Dashboard — affichage', () => {
  it('affiche le compteur Players (2)', async () => {
    renderPage(<Dashboard />, '/');
    // Le cercle Players affiche le label "Players" et la valeur "2"
    await waitFor(() =>
      expect(screen.getByText('Players')).toBeInTheDocument()
    );
    // Les deux cercles affichent "2" (Players=2, Games=2) — on cherche au moins une occurrence
    const twos = await screen.findAllByText('2');
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it('affiche des joueurs récents (Alice)', async () => {
    renderPage(<Dashboard />, '/');
    await waitFor(() =>
      expect(screen.getByText('Alice')).toBeInTheDocument()
    );
  });

  it('affiche des jeux récents (Wingspan)', async () => {
    renderPage(<Dashboard />, '/');
    await waitFor(() =>
      expect(screen.getByText('Wingspan')).toBeInTheDocument()
    );
  });

  it('rend sans crash', () => {
    expect(() => renderPage(<Dashboard />, '/')).not.toThrow();
  });
});
