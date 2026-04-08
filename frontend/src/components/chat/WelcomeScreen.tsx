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
  FileSpec,
  useChatMessages,
  useChatSession,
  useConfig
} from '@chainlit/react-client';

import { Logo } from '@/components/Logo';
import { Markdown } from '@/components/Markdown';
import WaterMark from '@/components/WaterMark';

import MessageComposer from './MessageComposer';
import Starters from './Starters';

interface Props {
  fileSpec: FileSpec;
  onFileUpload: (payload: File[]) => void;
  onFileUploadError: (error: string) => void;
  autoScrollRef: MutableRefObject<boolean>;
}

export default function WelcomeScreen(props: Props) {
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
      return true;
    }

    if (selectedChatProfile?.starters?.length) {
      return false;
    }

    return Boolean(config?.starterWidget?.tabs?.length);
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
          <Starters />
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
        {hasStarterWidget ? <Starters /> : null}
        {hasStarterWidget ? null : <Starters />}
      </div>
      <div className="mt-auto flex flex-col items-center gap-2 w-full">
        <MessageComposer {...props} />
        <WaterMark />
      </div>
    </div>
  );
}
