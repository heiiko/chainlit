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
  default: () => <div data-testid="starters" id="starters" />
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
});
