import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAudio, useConfig } from '@chainlit/react-client';

import VoiceButton from '@/components/chat/MessageComposer/VoiceButton';

vi.mock('react-hotkeys-hook', () => ({
  useHotkeys: vi.fn()
}));

vi.mock('@chainlit/react-client', () => ({
  useAudio: vi.fn(),
  useConfig: vi.fn()
}));

vi.mock('@/components/AudioPresence', () => ({
  default: () => <div data-testid="audio-presence" />
}));

vi.mock('components/i18n', () => ({
  Translator: ({ path, suffix }: { path: string; suffix?: string }) => (
    <span>
      {path}
      {suffix}
    </span>
  )
}));

const audioState = {
  audioConnection: 'off',
  endConversation: vi.fn(),
  startConversation: vi.fn()
};

describe('VoiceButton', () => {
  const renderVoiceButton = (config: any) => {
    (useConfig as any).mockReturnValue({ config });
    (useAudio as any).mockReturnValue(audioState);

    return render(<VoiceButton />);
  };

  it('renders when project audio is enabled and no user capability override is provided', () => {
    renderVoiceButton({
      features: { audio: { enabled: true } }
    });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not render when voice interaction is disabled for the user', () => {
    const { container } = renderVoiceButton({
      features: { audio: { enabled: true } },
      userCapabilities: { features: { voice_interaction: false } }
    });

    expect(container.firstChild).toBeNull();
  });
});
