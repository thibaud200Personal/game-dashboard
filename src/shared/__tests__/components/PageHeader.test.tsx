import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageHeader from '@/shared/components/PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Statistics" />);
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('renders left and right slots', () => {
    render(
      <PageHeader
        title="Stats"
        left={<button>Back</button>}
        right={<button>Settings</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  it('renders a spacer div when right slot is omitted', () => {
    const { container } = render(
      <PageHeader title="Stats" left={<button>Back</button>} />
    );
    // 3 children: left, title, right spacer
    const header = container.firstChild as HTMLElement;
    expect(header.children.length).toBe(3);
  });
});
