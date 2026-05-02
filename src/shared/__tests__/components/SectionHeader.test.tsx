import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Trophy } from '@phosphor-icons/react';
import SectionHeader from '@/shared/components/SectionHeader';

describe('SectionHeader', () => {
  it('renders icon and title', () => {
    render(<SectionHeader icon={<Trophy />} title="Top Players" />);
    expect(screen.getByText('Top Players')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(
      <SectionHeader
        icon={<Trophy />}
        title="Top Players"
        action={<button>See all</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'See all' })).toBeInTheDocument();
  });

  it('renders without action', () => {
    render(<SectionHeader icon={<Trophy />} title="Top Players" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
