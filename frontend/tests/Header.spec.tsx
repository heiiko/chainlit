import { render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/header';

const mocks = vi.hoisted(() => ({
  useAudio: vi.fn(),
  useAuth: vi.fn(),
  useChatData: vi.fn(),
  useConfig: vi.fn(),
  useSidebar: vi.fn(),
  navigate: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mocks.navigate
}));

vi.mock('@chainlit/react-client', () => ({
  useAudio: mocks.useAudio,
  useAuth: mocks.useAuth,
  useChatData: mocks.useChatData,
  useConfig: mocks.useConfig
}));

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: mocks.useSidebar
}));

vi.mock('@/components/AudioPresence', () => ({
  default: () => <div data-testid="audio-presence" />
}));

vi.mock('@/components/ButtonLink', () => ({
  default: () => <a href="https://example.com">Link</a>
}));

vi.mock('@/components/header/ApiKeys', () => ({
  default: () => <button type="button">Api keys</button>
}));

vi.mock('@/components/header/ChatProfiles', () => ({
  default: () => <button type="button">Chat profile</button>
}));

vi.mock('@/components/header/NewChat', () => ({
  default: () => <button type="button">New chat</button>
}));

vi.mock('@/components/header/Readme', () => ({
  default: () => <button type="button">Readme</button>
}));

vi.mock('@/components/header/Share', () => ({
  default: () => <button type="button">Share</button>
}));

vi.mock('@/components/header/SidebarTrigger', () => ({
  default: () => <button type="button">Sidebar</button>
}));

vi.mock('@/components/header/ThemeToggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>
}));

vi.mock('@/components/header/UserNav', () => ({
  default: () => <button type="button">User</button>
}));

describe('Header', () => {
  beforeEach(() => {
    mocks.useAudio.mockReturnValue({ audioConnection: 'off' });
    mocks.useAuth.mockReturnValue({ data: { requireLogin: false } });
    mocks.useChatData.mockReturnValue({ chatSettingsInputs: [] });
    mocks.useConfig.mockReturnValue({
      config: {
        dataPersistence: false,
        ui: {
          header_links: []
        }
      }
    });
    mocks.useSidebar.mockReturnValue({
      isMobile: false,
      open: false,
      openMobile: false
    });
  });

  it('renders the public logo in the centered header container', () => {
    render(
      <RecoilRoot>
        <Header />
      </RecoilRoot>
    );

    const logo = screen.getByRole('img', { name: 'logo' });

    expect(logo).toHaveAttribute('src', 'public/icon/logo.png');
    expect(logo).toHaveClass('h-10');
    expect(logo).not.toHaveClass('w-10');
    expect(logo.parentElement).toHaveClass('absolute', 'top-1/2', 'left-1/2');
  });
});
