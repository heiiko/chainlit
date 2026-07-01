import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MessageAvatar } from '@/components/chat/Messages/Message/Avatar';

const mocks = vi.hoisted(() => ({
  apiClient: {
    buildEndpoint: vi.fn((path: string) => `http://chainlit.test${path}`)
  },
  useChatSession: vi.fn(),
  useConfig: vi.fn()
}));

vi.mock('@chainlit/react-client', async () => {
  const React = await import('react');

  return {
    ChainlitContext: React.createContext(mocks.apiClient),
    useChatSession: mocks.useChatSession,
    useConfig: mocks.useConfig
  };
});

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  AvatarFallback: ({ children, ...props }: any) => (
    <span {...props}>{children}</span>
  ),
  AvatarImage: (props: any) => <img {...props} />
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: any) => <span {...props} />
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <>{children}</>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>
}));

describe('MessageAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useChatSession.mockReturnValue({ chatProfile: 'Research' });
  });

  it('uses the selected chat profile icon for renamed steps', () => {
    mocks.useConfig.mockReturnValue({
      config: {
        ui: { name: 'Assistant' },
        chatProfiles: [
          {
            name: 'Research',
            icon: 'https://example.com/research.png',
            markdown_description: '',
            default: true
          }
        ]
      }
    });

    render(<MessageAvatar author="Renamed Step" />);

    expect(screen.getByAltText('Avatar for Renamed Step')).toHaveAttribute(
      'src',
      'https://example.com/research.png'
    );
    expect(mocks.apiClient.buildEndpoint).not.toHaveBeenCalled();
  });

  it('falls back to the author avatar when the selected chat profile has no icon', () => {
    mocks.useConfig.mockReturnValue({
      config: {
        ui: { name: 'Assistant' },
        chatProfiles: [
          {
            name: 'Research',
            markdown_description: '',
            default: true
          }
        ]
      }
    });

    render(<MessageAvatar author="Renamed Step" />);

    expect(screen.getByAltText('Avatar for Renamed Step')).toHaveAttribute(
      'src',
      'http://chainlit.test/avatars/Renamed Step'
    );
    expect(mocks.apiClient.buildEndpoint).toHaveBeenCalledWith(
      '/avatars/Renamed Step'
    );
  });
});
