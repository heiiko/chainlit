import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  useChatMessages,
  useChatSession,
  useConfig
} from '@chainlit/react-client';

import WelcomeScreen from '@/components/chat/WelcomeScreen';

vi.mock('@chainlit/react-client', async () => {
  const React = await import('react');

  return {
    ChainlitContext: React.createContext({
      buildEndpoint: (path: string) => path
    }),
    useChatMessages: vi.fn(),
    useChatSession: vi.fn(),
    useConfig: vi.fn()
  };
});

vi.mock('@/components/Logo', () => ({
  Logo: () => <div data-testid="logo" />
}));

vi.mock('@/components/Markdown', () => ({
  Markdown: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/components/WaterMark', () => ({
  default: () => <div data-testid="watermark" />
}));

vi.mock('@/components/chat/MessageComposer', () => ({
  default: () => <div id="message-composer" />
}));

vi.mock('@/components/chat/Starters', () => ({
  default: ({
    autoScrollRef
  }: {
    autoScrollRef?: React.MutableRefObject<boolean>;
  }) => (
    <div
      data-testid="starters"
      data-autoscroll-ref={autoScrollRef ? 'true' : 'false'}
      id="starters"
    />
  )
}));

describe('WelcomeScreen', () => {
  it('keeps the empty thread composer outside the scrollable welcome content', () => {
    (useChatMessages as any).mockReturnValue({ messages: [] });
    (useChatSession as any).mockReturnValue({ chatProfile: undefined });
    (useConfig as any).mockReturnValue({
      config: {
        chatProfiles: [],
        starterWidget: {
          tabs: [{ key: 'news', label: 'News', starters: [] }]
        }
      }
    });

    const { container } = render(<WelcomeScreen />);

    expect(screen.getByTestId('starters')).toBeInTheDocument();
    expect(
      container.querySelector('#welcome-screen #message-composer')
    ).not.toBeInTheDocument();
  });

  it('places the native starter widget over an overscroll-safe full-width header backdrop', () => {
    (useChatMessages as any).mockReturnValue({ messages: [] });
    (useChatSession as any).mockReturnValue({ chatProfile: undefined });
    (useConfig as any).mockReturnValue({
      config: {
        chatProfiles: [],
        starterWidget: {
          tabs: [
            {
              key: 'missed-news',
              label: 'Wat heb ik gemist?',
              starters: [
                {
                  label: 'In het nieuws',
                  message: 'Vat het nieuws samen'
                }
              ]
            }
          ]
        }
      }
    });

    const { container } = render(<WelcomeScreen />);

    const welcomeScreen = container.querySelector('#welcome-screen');
    const overscrollBackdrop = screen.getByTestId(
      'welcome-header-overscroll-backdrop'
    );
    const backdrop = screen.getByTestId('welcome-header-backdrop');
    const content = screen.getByTestId('welcome-content');

    expect(welcomeScreen).toHaveClass('relative', 'isolate');
    expect(overscrollBackdrop).toHaveAttribute('aria-hidden', 'true');
    expect(overscrollBackdrop).toHaveClass(
      'pointer-events-none',
      'fixed',
      'left-0',
      'top-0',
      'z-0',
      'h-[114px]',
      'w-screen'
    );
    expect(overscrollBackdrop).toHaveStyle({
      backgroundColor: 'var(--mfn-header-background, hsl(var(--background)))'
    });
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    expect(backdrop).toHaveClass(
      'pointer-events-none',
      'absolute',
      'left-1/2',
      'top-[-100vh]',
      'z-0',
      'h-[calc(100vh+54px)]',
      'w-screen',
      '-translate-x-1/2'
    );
    expect(backdrop).toHaveStyle({
      backgroundColor: 'var(--mfn-header-background, hsl(var(--background)))'
    });
    expect(content).toHaveClass('relative', 'z-10', 'pt-[4px]');
  });

  it('keeps the starter backdrop at the top of a conversation when the starter widget remains visible', () => {
    const autoScrollRef = { current: false };
    (useChatMessages as any).mockReturnValue({
      messages: [{ id: 'message-id', type: 'user_message', output: 'hello' }]
    });
    (useChatSession as any).mockReturnValue({ chatProfile: undefined });
    (useConfig as any).mockReturnValue({
      config: {
        chatProfiles: [],
        starterWidget: {
          tabs: [
            {
              key: 'news',
              label: 'News',
              starters: [{ label: 'Top stories', message: 'Top stories' }]
            }
          ]
        }
      }
    });

    const WelcomeScreenWithProps = WelcomeScreen as any;
    const { container } = render(
      <WelcomeScreenWithProps autoScrollRef={autoScrollRef} />
    );

    expect(container.querySelector('#welcome-screen')).toHaveClass(
      'relative',
      'isolate'
    );
    expect(
      screen.queryByTestId('welcome-header-overscroll-backdrop')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('welcome-header-backdrop')).toBeInTheDocument();
    expect(screen.getByTestId('welcome-content')).toHaveClass(
      'relative',
      'z-10',
      'pt-[4px]'
    );
    expect(screen.getByTestId('starters')).toHaveAttribute(
      'data-autoscroll-ref',
      'true'
    );
  });

  it('hides the starter widget when it only contains legacy article briefings', () => {
    (useChatMessages as any).mockReturnValue({
      messages: [{ id: 'message-id', type: 'user_message', output: 'hello' }]
    });
    (useChatSession as any).mockReturnValue({ chatProfile: undefined });
    (useConfig as any).mockReturnValue({
      config: {
        chatProfiles: [],
        starterWidget: {
          articleBriefings: {
            articles: [
              {
                headline: 'Market update',
                bullets: ['One', 'Two', 'Three']
              }
            ]
          }
        }
      }
    });

    render(<WelcomeScreen />);

    expect(screen.queryByTestId('starters')).toBeNull();
  });
});
