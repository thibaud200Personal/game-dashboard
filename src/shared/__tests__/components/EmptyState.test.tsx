import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameController } from '@phosphor-icons/react';
import EmptyState from '@/shared/components/EmptyState';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={<GameController />} title="No games" description="Add your first game" />);
    expect(screen.getByText('No games')).toBeInTheDocument();
    expect(screen.getByText('Add your first game')).toBeInTheDocument();
  });

  it('renders CTA when provided', () => {
    render(
      <EmptyState
        icon={<GameController />}
        title="No games"
        action={<button>Add game</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Add game' })).toBeInTheDocument();
  });

  it('renders without description or action', () => {
    render(<EmptyState icon={<GameController />} title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
