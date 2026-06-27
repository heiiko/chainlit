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

  it('uses the user-nav avatar theme color for the avatar fallback', () => {
    render(<UserNav />);

    const userNavButton = screen.getByRole('button');
    const fallback = screen.getByText('A');

    expect(userNavButton).toHaveAttribute('id', 'user-nav-button');
    expect(fallback).toHaveClass(
      'bg-[color:var(--mfn-user-nav-avatar-background,rgb(26,38,63))]',
      'text-primary-foreground',
      'font-semibold'
    );
    expect(fallback).not.toHaveClass('bg-primary');
  });
});
