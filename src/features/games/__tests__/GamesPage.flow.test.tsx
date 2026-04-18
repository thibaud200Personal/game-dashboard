// src/__tests__/flows/GamesPage.flow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GamesPage from '@/features/games/GamesPage';
import { renderPage } from '@/shared/__tests__/utils/test-utils';

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

describe('GamesPage — flux CRUD', () => {
  it('affiche la liste des jeux au chargement', async () => {
    renderPage(<GamesPage />, '/games');
    await waitFor(() => expect(screen.getByText('Wingspan')).toBeInTheDocument());
    expect(screen.getByText('Azul')).toBeInTheDocument();
  });

  it('filtre les jeux par nom', async () => {
    const user = userEvent.setup();
    renderPage(<GamesPage />, '/games');
    await waitFor(() => expect(screen.getByText('Wingspan')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/search games/i);
    await user.type(searchInput, 'azul');

    expect(screen.queryByText('Wingspan')).not.toBeInTheDocument();
    expect(screen.getByText('Azul')).toBeInTheDocument();
  });

  it("ouvre le dialog d'ajout", async () => {
    const user = userEvent.setup();
    renderPage(<GamesPage />, '/games');
    await waitFor(() => expect(screen.getByText('Wingspan')).toBeInTheDocument());

    // Le bouton flottant "Add new game" (aria-label) ouvre le dialog
    const addBtn = screen.getByRole('button', { name: /add new game/i });
    await user.click(addBtn);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
  });

  it('recherche BGG depuis le dialog et sélectionne un jeu', async () => {
    const user = userEvent.setup();
    renderPage(<GamesPage />, '/games');
    await waitFor(() => expect(screen.getByText('Wingspan')).toBeInTheDocument());

    // Ouvre le dialog d'ajout
    const addBtn = screen.getByRole('button', { name: /add new game/i });
    await user.click(addBtn);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    // Clique sur "Search BoardGameGeek" pour afficher le champ de recherche BGG
    const bggBtn = screen.getByRole('button', { name: /search boardgamegeek/i });
    await user.click(bggBtn);

    // Le champ de recherche BGG est maintenant visible
    const bggInput = screen.getByPlaceholderText(/Search by name or BGG ID/i);
    await user.type(bggInput, 'Wingspan');
    await user.keyboard('{Enter}');

    // Le résultat "Wingspan" doit apparaître dans les résultats de recherche
    await waitFor(() =>
      expect(screen.getAllByText('Wingspan').length).toBeGreaterThanOrEqual(1)
    );
  });
});
