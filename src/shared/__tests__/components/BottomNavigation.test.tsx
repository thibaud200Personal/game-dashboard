import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNavigation from '@/shared/components/BottomNavigation';

function renderNav(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <BottomNavigation />
    </MemoryRouter>
  );
}

describe('BottomNavigation', () => {
  it('renders all navigation items', () => {
    renderNav();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/players/i)).toBeInTheDocument();
    expect(screen.getByText(/games/i)).toBeInTheDocument();
    expect(screen.getByText(/stats/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
  });

  it('highlights the current route', () => {
    renderNav('/games');
    const gamesLink = screen.getByText(/games/i).closest('a');
    expect(gamesLink).toHaveClass('text-teal-400');
  });

  it('highlights dashboard when at root', () => {
    renderNav('/');
    const dashLink = screen.getByText(/dashboard/i).closest('a');
    expect(dashLink).toHaveClass('text-teal-400');
  });

  it('all nav items are links with accessible names', () => {
    renderNav();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(5);
    links.forEach(link => expect(link).toHaveAccessibleName());
  });
});
