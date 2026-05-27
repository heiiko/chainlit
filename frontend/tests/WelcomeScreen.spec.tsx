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

  it('passes the shared autoscroll ref to starter buttons when the starter widget remains visible', () => {
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
    render(<WelcomeScreenWithProps autoScrollRef={autoScrollRef} />);

    expect(screen.getByTestId('starters')).toHaveAttribute(
      'data-autoscroll-ref',
      'true'
    );
  });
});
