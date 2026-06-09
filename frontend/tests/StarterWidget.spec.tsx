import { fireEvent, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StarterWidget from '@/components/chat/StarterWidget';

const { callActionMock, sendMessageMock } = vi.hoisted(() => ({
  callActionMock: vi.fn(),
  sendMessageMock: vi.fn()
}));

vi.mock('@chainlit/react-client', async () => {
  const React = await import('react');
  const { atom } = await import('recoil');

  return {
    ChainlitContext: React.createContext({
      buildEndpoint: (path: string) => path,
      callAction: callActionMock
    }),
    modesState: atom({
      key: 'StarterWidgetModesState',
      default: []
    }),
    sessionIdState: atom({
      key: 'StarterWidgetSessionIdState',
      default: 'session-123'
    }),
    useAuth: vi.fn(() => ({ user: { identifier: 'test-user' } })),
    useChatData: vi.fn(() => ({ loading: false, connected: true })),
    useChatInteract: vi.fn(() => ({ sendMessage: sendMessageMock }))
  };
});

describe('StarterWidget', () => {
  beforeEach(() => {
    callActionMock.mockClear();
    sendMessageMock.mockClear();

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn()
    }));
  });

  it('enables autoscroll before sending a starter message', () => {
    const autoScrollRef = { current: false };
    const StarterWidgetWithProps = StarterWidget as any;

    render(
      <RecoilRoot>
        <StarterWidgetWithProps
          autoScrollRef={autoScrollRef}
          widget={{
            tabs: [
              {
                key: 'news',
                label: 'News',
                starters: [
                  {
                    label: 'Top stories',
                    message: 'Tell me the top stories'
                  }
                ]
              }
            ]
          }}
        />
      </RecoilRoot>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Top stories' }));

    expect(autoScrollRef.current).toBe(true);
    expect(sendMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        output: 'Tell me the top stories',
        type: 'user_message'
      }),
      []
    );
  });

  it('renders appended article briefings and calls the configured audio action', () => {
    const StarterWidgetWithProps = StarterWidget as any;

    render(
      <RecoilRoot>
        <StarterWidgetWithProps
          widget={{
            tabs: [
              {
                key: 'news',
                label: 'News',
                starters: [
                  {
                    label: 'Top stories',
                    message: 'Tell me the top stories'
                  }
                ]
              }
            ],
            articleBriefings: {
              title: 'Hoofdpunten',
              audioActionName: 'readaloud_action',
              labels: {
                listen: 'Voorlezen',
                open: 'Lees het artikel'
              },
              articles: [
                {
                  urn: 'urn:article:1',
                  headline: 'Chipsector trekt de beurs hoger',
                  bullets: [
                    'De technologiesector wint terrein.',
                    'Beleggers kijken naar nieuwe cijfers.',
                    'Analisten blijven voorzichtig.'
                  ],
                  imageUrl: 'https://img.test/chips.jpg?ratio=16/9&width=1280',
                  articleUrl: 'https://www.tijd.be/chips'
                }
              ]
            }
          }}
        />
      </RecoilRoot>
    );

    expect(
      screen.getByRole('heading', { name: 'Hoofdpunten' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Chipsector trekt de beurs hoger' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('De technologiesector wint terrein.')
    ).toBeInTheDocument();

    const articleLink = screen.getByRole('link', { name: 'Lees het artikel' });
    expect(articleLink).toHaveAttribute('href', 'https://www.tijd.be/chips');

    fireEvent.click(screen.getByRole('button', { name: 'Voorlezen' }));

    expect(callActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'readaloud_action',
        payload: {
          content:
            'Chipsector trekt de beurs hoger\nDe technologiesector wint terrein.\nBeleggers kijken naar nieuwe cijfers.\nAnalisten blijven voorzichtig.',
          query: 'Chipsector trekt de beurs hoger'
        }
      }),
      'session-123'
    );
  });
});
