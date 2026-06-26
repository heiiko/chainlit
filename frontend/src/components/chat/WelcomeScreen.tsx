import { cn, hasMessage } from '@/lib/utils';
import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  ChainlitContext,
  IStarterWidget,
  useChatMessages,
  useChatSession,
  useConfig
} from '@chainlit/react-client';

import { Logo } from '@/components/Logo';
import { Markdown } from '@/components/Markdown';

import Starters from './Starters';

interface Props {
  autoScrollRef?: MutableRefObject<boolean>;
}

function hasStarterWidgetContent(widget?: IStarterWidget) {
  return Boolean(widget?.tabs?.some((tab) => tab.starters.length));
}

export default function WelcomeScreen({ autoScrollRef }: Props) {
  const apiClient = useContext(ChainlitContext);
  const { config } = useConfig();
  const { chatProfile } = useChatSession();
  const { messages } = useChatMessages();
  const [isVisible, setIsVisible] = useState(false);

  const chatProfiles = config?.chatProfiles;

  const allowHtml = config?.features?.unsafe_allow_html;
  const latex = config?.features?.latex;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const selectedChatProfile = useMemo(() => {
    if (!chatProfile) return undefined;
    return chatProfiles?.find((profile) => profile.name === chatProfile);
  }, [chatProfile, chatProfiles]);

  const hasStarterWidget = useMemo(() => {
    if (selectedChatProfile?.starterWidget) {
      return hasStarterWidgetContent(selectedChatProfile.starterWidget);
    }

    if (selectedChatProfile?.starters?.length) {
      return false;
    }

    return hasStarterWidgetContent(config?.starterWidget);
  }, [config, selectedChatProfile]);

  const logo = useMemo(() => {
    if (chatProfile && chatProfiles) {
      const currentChatProfile = chatProfiles.find(
        (cp) => cp.name === chatProfile
      );
      if (currentChatProfile?.icon) {
        return (
          <div className="flex flex-col gap-2 mb-2 items-center">
            <img
              className="h-16 w-16 rounded-full"
              src={
                currentChatProfile?.icon.startsWith('/public')
                  ? apiClient.buildEndpoint(currentChatProfile?.icon)
                  : currentChatProfile?.icon
              }
            />
            {currentChatProfile?.markdown_description ? (
              <Markdown
                className="font-sans"
                allowHtml={allowHtml}
                latex={latex}
                renderMarkdown={true}
              >
                {currentChatProfile.markdown_description}
              </Markdown>
            ) : null}
          </div>
        );
      }
    }

    return <Logo className="w-[200px] mb-2" />;
  }, [chatProfiles, chatProfile]);

  const threadHasMessages = hasMessage(messages);

  if (threadHasMessages && !hasStarterWidget) return null;

  if (threadHasMessages) {
    return (
      <div
        id="welcome-screen"
        className={cn(
          'flex w-full justify-center pb-8 welcome-screen transition-opacity duration-500 opacity-0 delay-100',
          isVisible && 'opacity-100'
        )}
      >
        <div className="flex flex-col gap-4 w-full items-center">
          {logo}
          <Starters autoScrollRef={autoScrollRef} />
        </div>
      </div>
    );
  }

  return (
    <div
      id="welcome-screen"
      className={cn(
        'flex flex-col gap-4 w-full flex-grow welcome-screen mx-auto transition-opacity duration-500 opacity-0 delay-100',
        isVisible && 'opacity-100'
      )}
    >
      <div className="flex flex-col gap-4 w-full items-center">
        {logo}
        {hasStarterWidget ? <Starters autoScrollRef={autoScrollRef} /> : null}
        {hasStarterWidget ? null : <Starters autoScrollRef={autoScrollRef} />}
      </div>
    </div>
  );
}
