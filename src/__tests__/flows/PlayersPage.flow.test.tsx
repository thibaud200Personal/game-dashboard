// src/__tests__/flows/PlayersPage.flow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayersPage from '@/components/PlayersPage';
import { renderPage } from '@/__tests__/utils/test-utils';

vi.mock('@/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

describe('PlayersPage — flux CRUD', () => {
  it('affiche la liste des joueurs au chargement', async () => {
    renderPage(<PlayersPage />, '/players');
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('filtre les joueurs par nom', async () => {
    const user = userEvent.setup();
    renderPage(<PlayersPage />, '/players');
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/search players/i);
    await user.type(searchInput, 'bob');

    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it("ouvre le dialog d'ajout au clic sur le bouton +", async () => {
    const user = userEvent.setup();
    renderPage(<PlayersPage />, '/players');
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add new player/i });
    await user.click(addBtn);

    await waitFor(() =>
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    );
  });

  it('crée un joueur via le formulaire', async () => {
    const user = userEvent.setup();
    renderPage(<PlayersPage />, '/players');
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add new player/i });
    await user.click(addBtn);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/nom/i), 'Charlie');
    // Le champ pseudo est pré-rempli avec la valeur du nom, on le clear puis on tape
    const pseudoInput = screen.getByLabelText(/pseudo/i);
    await user.clear(pseudoInput);
    await user.type(pseudoInput, 'charlie99');

    await user.click(screen.getByRole('button', { name: /ajouter/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it("pseudo dupliqué affiche le message d'erreur dans le dialog", async () => {
    const user = userEvent.setup();
    renderPage(<PlayersPage />, '/players');
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    const addBtn = screen.getByRole('button', { name: /add new player/i });
    await user.click(addBtn);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/nom/i), 'Alice2');
    const pseudoInput = screen.getByLabelText(/pseudo/i);
    await user.clear(pseudoInput);
    await user.type(pseudoInput, 'alice42');
    await user.click(screen.getByRole('button', { name: /ajouter/i }));

    await waitFor(() =>
      expect(
        screen.getByText(/ce pseudo est déjà utilisé/i)
      ).toBeInTheDocument()
    );
  });
});
