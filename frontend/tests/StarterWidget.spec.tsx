import { fireEvent, render, screen } from '@testing-library/react';
import { RecoilRoot } from 'recoil';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import StarterWidget from '@/components/chat/StarterWidget';

const { sendMessageMock } = vi.hoisted(() => ({
  sendMessageMock: vi.fn()
}));

vi.mock('@chainlit/react-client', async () => {
  const React = await import('react');
  const { atom } = await import('recoil');

  return {
    ChainlitContext: React.createContext({
      buildEndpoint: (path: string) => path
    }),
    modesState: atom({
      key: 'StarterWidgetModesState',
      default: []
    }),
    useAuth: vi.fn(() => ({ user: { identifier: 'test-user' } })),
    useChatData: vi.fn(() => ({ loading: false, connected: true })),
    useChatInteract: vi.fn(() => ({ sendMessage: sendMessageMock }))
  };
});

describe('StarterWidget', () => {
  beforeEach(() => {
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
});
