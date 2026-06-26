import { useEffect, useMemo, useState } from 'react';

import Starters from '@chainlit/app/src/components/chat/Starters';
import { cn, hasMessage } from '@chainlit/app/src/lib/utils';
import {
  IStarterWidget,
  useChatMessages,
  useChatSession,
  useConfig
} from '@chainlit/react-client';

function hasStarterWidgetContent(widget?: IStarterWidget) {
  return Boolean(widget?.tabs?.some((tab) => tab.starters.length));
}

export default function WelcomeScreen() {
  const { config } = useConfig();
  const { chatProfile } = useChatSession();
  const { messages } = useChatMessages();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const selectedChatProfile = useMemo(() => {
    if (!chatProfile) return undefined;
    return config?.chatProfiles.find((profile) => profile.name === chatProfile);
  }, [chatProfile, config]);

  const hasStarterWidget = useMemo(() => {
    if (selectedChatProfile?.starterWidget) {
      return hasStarterWidgetContent(selectedChatProfile.starterWidget);
    }

    if (selectedChatProfile?.starters?.length) {
      return false;
    }

    return hasStarterWidgetContent(config?.starterWidget);
  }, [config, selectedChatProfile]);

  const threadHasMessages = hasMessage(messages);

  if (threadHasMessages && !hasStarterWidget) return null;

  return (
    <div
      className={cn(
        'flex flex-col pb-4 flex-grow welcome-screen transition-opacity duration-500 opacity-0 delay-100',
        isVisible && 'opacity-100'
      )}
    >
      <Starters className="items-end mt-auto" />
    </div>
  );
}
