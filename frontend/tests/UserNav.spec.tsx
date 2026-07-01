import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserNav from '@/components/header/UserNav';

const mocks = vi.hoisted(() => ({
  logout: vi.fn(),
  useAuth: vi.fn()
}));

vi.mock('@chainlit/react-client', () => ({
  useAuth: mocks.useAuth
}));

vi.mock('components/i18n', () => ({
  Translator: ({ path }: { path: string }) => <span>{path}</span>
}));

describe('UserNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useAuth.mockReturnValue({
      logout: mocks.logout,
      user: {
        display_name: 'Alice Example',
        identifier: 'alice@example.com',
        metadata: {}
      }
    });
  });

  it('renders the user menu trigger as a matching lucide icon button', () => {
    render(<UserNav />);

    const userNavButton = screen.getByRole('button', { name: 'User menu' });
    const userIcon = userNavButton.querySelector('svg');

    expect(userNavButton).toHaveAttribute('id', 'user-nav-button');
    expect(userNavButton).toHaveClass(
      'h-9',
      'w-9',
      'text-primary-foreground',
      'hover:text-muted-foreground'
    );
    expect(userNavButton).not.toHaveClass('text-muted-foreground');
    expect(userIcon).toHaveClass('lucide-circle-user-round', '!size-6');
    expect(userIcon).toHaveAttribute('stroke-width', '2');
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });
});
