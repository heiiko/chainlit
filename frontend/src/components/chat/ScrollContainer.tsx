import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import { useChatMessages } from '@chainlit/react-client';

import { Button } from '@/components/ui/button';

interface Props {
  autoScrollUserMessage?: boolean;
  autoScrollAssistantMessage?: boolean;
  autoScrollRef?: MutableRefObject<boolean>;
  children: React.ReactNode;
  className?: string;
}

export default function ScrollContainer({
  autoScrollRef,
  autoScrollUserMessage,
  autoScrollAssistantMessage,
  children,
  className
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const positionedUserMessageRef = useRef<HTMLDivElement | null>(null);
  const pendingPositionScrollFrameRef = useRef<number | null>(null);
  const { messages } = useChatMessages();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const cancelPendingPositionScroll = useCallback(() => {
    if (pendingPositionScrollFrameRef.current === null) return;

    window.cancelAnimationFrame(pendingPositionScrollFrameRef.current);
    pendingPositionScrollFrameRef.current = null;
  }, []);

  const checkScrollEnd = useCallback(function checkScrollEnd() {
    if (!ref.current) return;

    const prevScrollTop = ref.current.scrollTop;

    setTimeout(() => {
      if (!ref.current) return;

      const currentScrollTop = ref.current.scrollTop;
      if (currentScrollTop === prevScrollTop) {
        setIsScrolling(false);

        const { scrollTop, scrollHeight, clientHeight } = ref.current;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setShowScrollButton(!atBottom);
      } else {
        checkScrollEnd();
      }
    }, 100);
  }, []);

  const scrollToPosition = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      if (!ref.current || !lastUserMessageRef.current) return;

      setIsScrolling(true);
      // Scroll to position the last user message at the top with some padding
      const scrollPosition = lastUserMessageRef.current.offsetTop - 20;

      ref.current.scrollTo({
        top: scrollPosition,
        behavior
      });

      if (autoScrollRef) {
        autoScrollRef.current = false;
      }

      setShowScrollButton(false);
      checkScrollEnd();
    },
    [autoScrollRef, checkScrollEnd]
  );

  const queueScrollToPosition = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      cancelPendingPositionScroll();

      if (typeof window.requestAnimationFrame !== 'function') {
        setTimeout(() => scrollToPosition(behavior), 0);
        return;
      }

      pendingPositionScrollFrameRef.current = window.requestAnimationFrame(
        () => {
          pendingPositionScrollFrameRef.current = window.requestAnimationFrame(
            () => {
              pendingPositionScrollFrameRef.current = null;
              scrollToPosition(behavior);
            }
          );
        }
      );
    },
    [cancelPendingPositionScroll, scrollToPosition]
  );

  // Calculate and update spacer height
  const updateSpacerHeight = useCallback(
    (forceUserMessageScroll = false) => {
      if (!ref.current) return;

      if (autoScrollUserMessage && lastUserMessageRef.current) {
        const containerHeight = ref.current.clientHeight;
        const lastMessageHeight = lastUserMessageRef.current.offsetHeight;

        // Calculate the height of all elements after the last user message
        let afterMessagesHeight = 0;
        let currentElement = lastUserMessageRef.current.nextElementSibling;

        // Iterate through all siblings after the last user message
        while (currentElement && currentElement !== spacerRef.current) {
          afterMessagesHeight += (currentElement as HTMLElement).offsetHeight;
          currentElement = currentElement.nextElementSibling;
        }

        // Position the last user message at the top with some padding
        // Subtract both the message height and the height of any messages after it
        const newSpacerHeight =
          containerHeight - lastMessageHeight - afterMessagesHeight - 32;

        // Only set a positive spacer height
        if (spacerRef.current) {
          spacerRef.current.style.height = `${Math.max(0, newSpacerHeight)}px`;
        }

        // Scroll to position the message at the top
        if (forceUserMessageScroll || afterMessagesHeight === 0) {
          queueScrollToPosition();
        } else if (autoScrollAssistantMessage && autoScrollRef?.current) {
          ref.current.scrollTop = ref.current.scrollHeight;
        }
      } else if (autoScrollAssistantMessage && autoScrollRef?.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    },
    [
      autoScrollUserMessage,
      autoScrollAssistantMessage,
      autoScrollRef,
      queueScrollToPosition
    ]
  );

  useEffect(() => {
    return () => cancelPendingPositionScroll();
  }, [cancelPendingPositionScroll]);

  // Find and set a ref to the last user message element
  useEffect(() => {
    if (!ref.current) return;

    if (messages.length === 0 && spacerRef.current) {
      spacerRef.current.style.height = `0px`;
      return;
    }

    // Get all message elements
    const userMessages = ref.current.querySelectorAll(
      '[data-step-type="user_message"]'
    );
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[
        userMessages.length - 1
      ] as HTMLDivElement;
      const shouldPositionUserMessage =
        positionedUserMessageRef.current !== lastUserMessage;

      lastUserMessageRef.current = lastUserMessage;

      // Update spacer height when last user message is found
      updateSpacerHeight(shouldPositionUserMessage);
      positionedUserMessageRef.current = lastUserMessage;
    }
  }, [messages, updateSpacerHeight]);

  // Add window resize listener to update spacer height
  useEffect(() => {
    if (!autoScrollUserMessage) return;

    const handleResize = () => {
      updateSpacerHeight();
    };

    window.addEventListener('resize', handleResize);

    // Initial update
    updateSpacerHeight();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [autoScrollUserMessage, updateSpacerHeight]);

  // Check scroll position on mount
  useEffect(() => {
    if (!ref.current) return;

    setTimeout(() => {
      if (!ref.current) return;

      const { scrollTop, scrollHeight, clientHeight } = ref.current;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollButton(!atBottom);
    }, 500);
  }, []);

  const scrollToBottom = () => {
    if (!ref.current) return;

    setIsScrolling(true);
    ref.current.scrollTo({
      top: ref.current.scrollHeight,
      behavior: 'smooth'
    });

    if (autoScrollRef) {
      autoScrollRef.current = true;
    }

    setShowScrollButton(false);
    checkScrollEnd();
  };

  const handleScroll = () => {
    if (!ref.current || isScrolling) return;
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (autoScrollRef) {
      autoScrollRef.current = atBottom;
    }

    setShowScrollButton(!atBottom);
  };

  return (
    <div className="relative flex min-h-0 flex-col flex-grow overflow-y-auto">
      <div
        ref={ref}
        className={cn(
          'flex min-h-0 flex-col flex-grow overflow-y-auto',
          className
        )}
        onScroll={handleScroll}
      >
        {children}
        {/* Dynamic spacer to position the last user message at the top */}
        <div ref={spacerRef} className="flex-shrink-0" />
      </div>

      {showScrollButton ? (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full"
            onClick={scrollToBottom}
          >
            <ArrowDown className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
