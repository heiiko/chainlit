import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatMessages } from '@chainlit/react-client';

import ScrollContainer from '@/components/chat/ScrollContainer';

vi.mock('@chainlit/react-client', () => ({
  useChatMessages: vi.fn()
}));

describe('ScrollContainer', () => {
  let scrollToMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    scrollToMock = vi.fn();

    Object.defineProperties(HTMLElement.prototype, {
      clientHeight: {
        configurable: true,
        get() {
          return 600;
        }
      },
      offsetHeight: {
        configurable: true,
        get() {
          return Number(this.getAttribute('data-offset-height') || 0);
        }
      },
      offsetTop: {
        configurable: true,
        get() {
          return Number(this.getAttribute('data-offset-top') || 0);
        }
      },
      scrollHeight: {
        configurable: true,
        get() {
          return 1200;
        }
      },
      scrollTo: {
        configurable: true,
        value: scrollToMock
      }
    });
  });

  it('hides horizontal overflow on the scrollable chat container', () => {
    (useChatMessages as any).mockReturnValue({ messages: [] });

    const { container } = render(
      <ScrollContainer>
        <div>Chat content</div>
      </ScrollContainer>
    );

    const scrollableContainer = container.firstElementChild?.firstElementChild;
    expect(scrollableContainer).toHaveClass('overflow-x-hidden');
  });

  it('positions a new user message without smooth scrolling even when a planning step already follows it', async () => {
    (useChatMessages as any).mockReturnValue({
      messages: [
        { id: 'user-message', type: 'user_message' },
        { id: 'planning-step', type: 'planning' }
      ]
    });

    render(
      <ScrollContainer
        autoScrollAssistantMessage
        autoScrollRef={{ current: true }}
        autoScrollUserMessage
      >
        <div
          data-offset-height="72"
          data-offset-top="420"
          data-step-type="user_message"
        >
          Starter question
        </div>
        <div data-offset-height="48" data-step-type="planning">
          Planning
        </div>
      </ScrollContainer>
    );

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({
        behavior: 'auto',
        top: 400
      });
    });
  });
});
