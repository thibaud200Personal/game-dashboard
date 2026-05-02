import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from '@phosphor-icons/react';
import StatCard from '@/shared/components/StatCard';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard icon={<Calendar />} value="42" label="Sessions" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('renders vertical layout by default', () => {
    const { container } = render(<StatCard icon={<Calendar />} value="42" label="Sessions" />);
    expect(container.firstChild).toHaveClass('text-center');
  });

  it('renders horizontal layout when specified', () => {
    const { container } = render(
      <StatCard icon={<Calendar />} value="42" label="Sessions" layout="horizontal" />
    );
    expect(container.firstChild).not.toHaveClass('text-center');
  });
});
