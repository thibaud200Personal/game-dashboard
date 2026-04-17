import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BottomNavigation from '@/shared/components/BottomNavigation';

function renderNav(initialPath = '/') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <BottomNavigation />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BottomNavigation — liens', () => {
  it('lien Dashboard navigue vers /', async () => {
    const user = userEvent.setup();
    renderNav('/players');
    await user.click(screen.getByText(/dashboard/i));
    expect(screen.getByText(/dashboard/i).closest('a')).toHaveClass('text-teal-400');
  });

  it('lien Players navigue vers /players', async () => {
    const user = userEvent.setup();
    renderNav('/');
    await user.click(screen.getByText(/players/i));
    expect(screen.getByText(/players/i).closest('a')).toHaveClass('text-teal-400');
  });

  it('lien Games navigue vers /games', async () => {
    const user = userEvent.setup();
    renderNav('/');
    await user.click(screen.getByText(/games/i));
    expect(screen.getByText(/games/i).closest('a')).toHaveClass('text-teal-400');
  });

  it('lien Stats navigue vers /stats', async () => {
    const user = userEvent.setup();
    renderNav('/');
    await user.click(screen.getByText(/stats/i));
    expect(screen.getByText(/stats/i).closest('a')).toHaveClass('text-teal-400');
  });

  it('lien Settings navigue vers /settings', async () => {
    const user = userEvent.setup();
    renderNav('/');
    await user.click(screen.getByText(/settings/i));
    expect(screen.getByText(/settings/i).closest('a')).toHaveClass('text-teal-400');
  });
});
