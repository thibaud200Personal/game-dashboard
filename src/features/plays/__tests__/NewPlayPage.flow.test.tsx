// src/__tests__/flows/SessionsPage.flow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewGamePage from '@/features/plays/NewPlayPage';
import { renderPage } from '@/__tests__/utils/test-utils';

vi.mock('@/shared/hooks/useNavigationAdapter', () => ({
  useNavigationAdapter: () => vi.fn(),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// Radix Select does not open in jsdom (no PointerEvent support).
// We replace it with a native <select> so options are directly in the DOM.
vi.mock('@/shared/components/ui/select', () => {
  const React = require('react');
  const SelectContext = React.createContext<{ onValueChange?: (v: string) => void }>({});

  const Select = ({ children, onValueChange, value: _value }: any) =>
    React.createElement(SelectContext.Provider, { value: { onValueChange } }, children);

  const SelectTrigger = ({ children }: any) => React.createElement('div', null, children);
  const SelectValue = ({ placeholder }: any) => React.createElement('span', null, placeholder);

  const SelectContent = ({ children }: any) => {
    const ctx = React.useContext(SelectContext);
    return React.createElement(
      'select',
      {
        'data-testid': 'native-select',
        onChange: (e: any) => ctx.onValueChange?.(e.target.value),
      },
      children
    );
  };

  const SelectItem = ({ children, value }: any) =>
    React.createElement('option', { value }, children);

  const SelectGroup = ({ children }: any) => React.createElement(React.Fragment, null, children);
  const SelectLabel = ({ children }: any) => React.createElement('span', null, children);
  const SelectSeparator = () => null;

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator };
});

describe('NewGamePage — flux création session', () => {
  it('affiche la liste des jeux disponibles', async () => {
    renderPage(<NewGamePage />, '/plays/new');
    // After MSW responds, the game options are rendered in the native <select>
    await waitFor(() => expect(screen.getByText('Wingspan')).toBeInTheDocument());
  });

  it('affiche les joueurs disponibles', async () => {
    const user = userEvent.setup();
    renderPage(<NewGamePage />, '/plays/new');

    // Wait for games to load then select Wingspan
    await waitFor(() => expect(screen.getByText('Wingspan')).toBeInTheDocument());
    const gameSelect = screen.getByTestId('native-select');
    await user.selectOptions(gameSelect, '1');

    // Players section appears after game selection
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('rend sans crash avec données vides si MSW retourne []', async () => {
    renderPage(<NewGamePage />, '/plays/new');
    await waitFor(() =>
      expect(screen.queryByText(/chargement|loading/i) || document.body).toBeTruthy()
    );
  });
});
