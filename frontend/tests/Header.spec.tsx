import { fireEvent, render, screen } from '@testing-library/react';
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

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>
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
    window.history.pushState({}, '', '/fr/');
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
    const header = logo.closest('#header');

    expect(header).toHaveClass('relative', 'z-20');
    expect(logo).toHaveAttribute('src', 'public/icon/logo.png');
    expect(logo).toHaveClass('h-10');
    expect(logo).not.toHaveClass('w-10');
    expect(logo.parentElement).toHaveClass(
      'absolute',
      'top-1/2',
      'left-1/2',
      'mt-1'
    );
  });

  it('renders the themed SVG accent after the header logo', () => {
    render(
      <RecoilRoot>
        <Header />
      </RecoilRoot>
    );

    const logo = screen.getByRole('img', { name: 'logo' });
    const accent = screen.getByTestId('header-logo-accent');

    expect(accent.tagName.toLowerCase()).toBe('svg');
    expect(accent.previousElementSibling).toBe(logo);
    expect(accent).toHaveClass('h-6');
    expect(accent).toHaveClass('bg-transparent');
    expect(accent).toHaveStyle({
      alignSelf: 'flex-start',
      marginLeft: '-8px'
    });
    expect(accent).toHaveAttribute(
      'fill',
      'var(--mfn-header-logo-accent-color, var(--mfn-starter-widget-pill-background, rgb(87,152,252)))'
    );
    expect(accent).toHaveAttribute(
      'stroke',
      'var(--mfn-header-logo-accent-color, var(--mfn-starter-widget-pill-background, rgb(87,152,252)))'
    );
  });

  it('toggles a flow-positioned info banner from a button before the user avatar', () => {
    render(
      <RecoilRoot>
        <Header />
      </RecoilRoot>
    );

    const infoButton = screen.getByRole('button', {
      name: 'Show assistant information'
    });
    const themeButton = screen.getByRole('button', { name: 'Theme' });
    const userButton = screen.getByRole('button', { name: 'User' });
    const infoIcon = infoButton.querySelector('svg');

    expect(
      themeButton.compareDocumentPosition(infoButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(infoButton.nextElementSibling).toBe(userButton);
    expect(infoButton).toHaveClass(
      'h-9',
      'w-9',
      'text-primary-foreground',
      'hover:text-muted-foreground'
    );
    expect(infoButton).not.toHaveClass('text-muted-foreground');
    expect(infoIcon).toHaveClass('lucide-info', '!size-6');
    expect(infoIcon).toHaveAttribute('stroke-width', '2');
    expect(screen.queryByText('Info')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: 'Assistant information' })
    ).not.toBeInTheDocument();

    fireEvent.click(infoButton);

    const banner = screen.getByRole('region', {
      name: 'Assistant information'
    });
    const header = screen.getByRole('img', { name: 'logo' }).closest('#header');

    expect(header).toHaveClass('h-[60px]');
    expect(banner.previousElementSibling).toBe(header);

    expect(banner).toHaveClass(
      'relative',
      'z-20',
      'w-full',
      'bg-[color:var(--mfn-user-nav-avatar-background)]',
      'text-white',
      'font-sans',
      'text-sm'
    );
    expect(banner).not.toHaveClass('absolute', 'top-full');
    expect(banner).toHaveTextContent(
      "Toutes réponses sur cette page sont générées par un assistant d’intelligence artificielle. Ces réponses sont exclusivement fondées sur les articles publiés par les journalistes de L'Echo. Des erreurs sont cependant possibles. En cas de doute, nous vous invitons à consulter les articles cités en source. Consultez la charte IA de L'Echo pour plus d’informations."
    );
    expect(banner).not.toHaveTextContent('Lorem ipsum');
    const echoCharterLink = screen.getByRole('link', {
      name: "charte IA de L'Echo"
    });

    expect(echoCharterLink).toHaveAttribute(
      'href',
      'https://www.lecho.be/dossiers/intelligence-artificielle/intelligence-artificielle-et-journalisme-la-charte-de-l-echo-et-du-tijd/10508789.html'
    );
    expect(echoCharterLink).toHaveAttribute('target', '_blank');
    expect(echoCharterLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(infoButton).toHaveAttribute('aria-expanded', 'true');
    expect(infoButton).toHaveAttribute(
      'aria-label',
      'Hide assistant information'
    );
  });

  it('shows the De Tijd disclosure copy and link on Dutch routes', () => {
    window.history.pushState({}, '', '/nl/');

    render(
      <RecoilRoot>
        <Header />
      </RecoilRoot>
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Show assistant information'
      })
    );

    const banner = screen.getByRole('region', {
      name: 'Assistant information'
    });

    expect(banner).toHaveTextContent(
      'Deze AI-toepassing geeft antwoorden op basis van het archief van De Tijd. Weet dat AI in sommige gevallen fouten kan maken. Controleer daarom bij twijfel altijd de bronartikels waarnaar wordt verwezen. Raadpleeg het AI-charter van De Tijd voor meer informatie.'
    );
    const tijdCharterLink = screen.getByRole('link', {
      name: 'AI-charter van De Tijd'
    });

    expect(tijdCharterLink).toHaveAttribute(
      'href',
      'https://www.tijd.be/dossiers/artificial-intelligence/artificiele-intelligentie-en-journalistiek-het-charter-van-de-tijd-en-l-echo/10510660.html'
    );
    expect(tijdCharterLink).toHaveAttribute('target', '_blank');
    expect(tijdCharterLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
