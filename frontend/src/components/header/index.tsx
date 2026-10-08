import { apiClient } from 'api';
import { Info } from 'lucide-react';
import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import {
  useAudio,
  useAuth,
  useChatData,
  useConfig
} from '@chainlit/react-client';

import AudioPresence from '@/components/AudioPresence';
import ButtonLink from '@/components/ButtonLink';
import { Settings } from '@/components/icons/Settings';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Translator } from 'components/i18n';

import { useLayoutMaxWidth } from '@/hooks/useLayoutMaxWidth';

import { chatSettingsSidebarOpenState } from '@/state/project';

import ApiKeys from './ApiKeys';
import ChatProfiles from './ChatProfiles';
import { NewChatDialog, useNewChatAction } from './NewChat';
import ReadmeButton from './Readme';
import ShareButton from './Share';
import SidebarTrigger from './SidebarTrigger';
import { ThemeToggle } from './ThemeToggle';
import UserNav from './UserNav';

const infoBannerContent = {
  fr: {
    beforeLink:
      'Les réponses générées sur cette page sont générées par un assistant d’intelligence artificielle. Ces réponses sont exclusivement fondées sur les articles des journalistes de L’Echo. Des erreurs sont cependant possibles. En cas de doute, consultez les articles cités et la ',
    linkText: "charte IA de L'Echo",
    linkUrl:
      'https://www.lecho.be/dossiers/intelligence-artificielle/intelligence-artificielle-et-journalisme-la-charte-de-l-echo-et-du-tijd/10508789.html',
    afterLink: '.'
  },
  nl: {
    beforeLink:
      'Deze AI-toepassing geeft antwoorden op basis van het archief van De Tijd. Weet dat AI in sommige gevallen fouten kan maken. Controleer daarom bij twijfel altijd de bronartikels waarnaar wordt verwezen. Raadpleeg het',
    linkText: 'AI-charter van De Tijd',
    linkUrl:
      'https://www.tijd.be/dossiers/artificial-intelligence/artificiele-intelligentie-en-journalistiek-het-charter-van-de-tijd-en-l-echo/10510660.html',
    afterLink: ' voor meer informatie.'
  }
};

const Header = memo(() => {
  const { audioConnection } = useAudio();
  const navigate = useNavigate();
  const { data } = useAuth();
  const { config } = useConfig();
  const layoutMaxWidth = useLayoutMaxWidth();
  const { chatSettingsInputs } = useChatData();
  const { open, openMobile, isMobile } = useSidebar();
  const [showInfoBanner, setShowInfoBanner] = useState(false);
  const newChat = useNewChatAction({ navigate });
  const setChatSettingsSidebarOpen = useSetRecoilState(
    chatSettingsSidebarOpenState
  );

  const sidebarOpen = isMobile ? openMobile : open;

  const historyEnabled = data?.requireLogin && config?.dataPersistence;
  const sidebarHidden = config?.ui?.default_sidebar_state === 'hidden';

  const links = config?.ui?.header_links || [];
  const infoContent = window.location.pathname.startsWith('/nl')
    ? infoBannerContent.nl
    : infoBannerContent.fr;

  const showSettingsInHeader =
    config?.ui?.chat_settings_location === 'sidebar' &&
    chatSettingsInputs.length > 0;

  const infoButton = (
    <Button
      id="header-info-button"
      aria-controls="header-info-banner"
      aria-expanded={showInfoBanner}
      aria-label={
        showInfoBanner
          ? 'Hide assistant information'
          : 'Show assistant information'
      }
      onClick={() => setShowInfoBanner((isVisible) => !isVisible)}
      variant="ghost"
      size="icon"
      className="text-primary-foreground hover:text-muted-foreground"
    >
      <Info className="!size-6" strokeWidth={2} />
    </Button>
  );

  return (
    <>
      <div
        className="relative z-20 flex h-[60px] shrink-0 items-center justify-between gap-2 p-3"
        id="header"
      >
        <div className="flex items-center">
          {historyEnabled && !sidebarHidden ? (
            !sidebarOpen ? (
              <SidebarTrigger />
            ) : null
          ) : null}
          <ChatProfiles navigate={navigate} />
        </div>

        <button
          type="button"
          aria-label="New chat"
          className="absolute top-1/2 left-4 mt-1 flex w-max -translate-y-1/2 items-center gap-2 px-2 cursor-pointer sm:left-1/2 sm:-translate-x-1/2 sm:px-0"
          onClick={newChat.handleClickOpen}
        >
          <img
            src={apiClient.buildEndpoint('/public/icon/logo-ai.png')}
            alt="logo"
            className="h-10 w-auto max-w-none shrink-0"
          />
          {audioConnection === 'on' ? (
            <AudioPresence
              type="server"
              height={35}
              width={70}
              barCount={4}
              barSpacing={2}
            />
          ) : null}
        </button>

        <div />
        <div className="flex items-center gap-1">
          <ShareButton />
          <ReadmeButton />
          <ApiKeys />
          {links &&
            links.map((link, index) => (
              <ButtonLink
                key={`${link.name}-${link.url}-${index}`}
                name={link.name}
                displayName={link.display_name}
                iconUrl={link.icon_url}
                url={link.url}
                target={link.target}
              />
            ))}
          {showSettingsInHeader && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  id="chat-settings-header-button"
                  onClick={() => setChatSettingsSidebarOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-muted-foreground"
                >
                  <Settings className="!size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <Translator path="chat.settings.title" />
              </TooltipContent>
            </Tooltip>
          )}
          <ThemeToggle />
          {infoButton}
          <UserNav />
        </div>
      </div>
      <NewChatDialog
        open={newChat.open}
        handleClose={newChat.handleClose}
        handleConfirm={newChat.handleConfirm}
      />
      {showInfoBanner ? (
        <div
          id="header-info-banner"
          role="region"
          aria-label="Assistant information"
          className="relative z-20 w-full shrink-0 bg-[color:var(--mfn-user-nav-avatar-background)] py-3 font-sans text-sm leading-7 text-white shadow-lg"
        >
          <div
            className="mx-auto w-full px-4"
            style={{ maxWidth: layoutMaxWidth }}
          >
            <div className="mx-auto w-full max-w-3xl">
              {infoContent.beforeLink}{' '}
              <a
                href={infoContent.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline underline-offset-2 hover:text-white"
              >
                {infoContent.linkText}
              </a>
              {infoContent.afterLink}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
});

export { Header };
