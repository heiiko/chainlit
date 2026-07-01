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

import { chatSettingsSidebarOpenState } from '@/state/project';

import ApiKeys from './ApiKeys';
import ChatProfiles from './ChatProfiles';
import NewChatButton from './NewChat';
import ReadmeButton from './Readme';
import ShareButton from './Share';
import SidebarTrigger from './SidebarTrigger';
import { ThemeToggle } from './ThemeToggle';
import UserNav from './UserNav';

const headerLogoAccentColor =
  'var(--mfn-header-logo-accent-color, var(--mfn-starter-widget-pill-background, rgb(87,152,252)))';

const infoBannerContent = {
  fr: {
    beforeLink:
      "Toutes réponses sur cette page sont générées par un assistant d’intelligence artificielle. Ces réponses sont exclusivement fondées sur les articles publiés par les journalistes de L'Echo. Des erreurs sont cependant possibles. En cas de doute, nous vous invitons à consulter les articles cités en source. Consultez la",
    linkText: "charte IA de L'Echo",
    linkUrl:
      'https://www.lecho.be/dossiers/intelligence-artificielle/intelligence-artificielle-et-journalisme-la-charte-de-l-echo-et-du-tijd/10508789.html',
    afterLink: ' pour plus d’informations.'
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
  const { chatSettingsInputs } = useChatData();
  const { open, openMobile, isMobile } = useSidebar();
  const [showInfoBanner, setShowInfoBanner] = useState(false);
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
          {historyEnabled && !sidebarHidden ? (
            !sidebarOpen ? (
              <NewChatButton navigate={navigate} />
            ) : null
          ) : (
            <NewChatButton navigate={navigate} />
          )}
          <ChatProfiles navigate={navigate} />
        </div>

        <div className="absolute top-1/2 left-1/2 mt-1 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2">
          <img src="public/icon/logo.png" alt="logo" className="h-10" />
          <svg
            aria-hidden="true"
            className="h-6 w-auto shrink-0 bg-transparent"
            data-testid="header-logo-accent"
            fill={headerLogoAccentColor}
            focusable="false"
            height="116"
            stroke={headerLogoAccentColor}
            style={{ alignSelf: 'flex-start', marginLeft: '-8px' }}
            viewBox="0 0 139 116"
            width="139"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44.4 30.6 C45.2 28.4 48.3 28.4 49.1 30.6 L56.7 53.2 C57 54 57.6 54.6 58.4 54.9 L80.3 62.3 C82.5 63 82.5 66.1 80.3 66.8 L58.4 74.2 C57.6 74.5 57 75.1 56.7 75.9 L49.1 98.5 C48.3 100.7 45.2 100.7 44.4 98.5 L36.8 75.9 C36.5 75.1 35.9 74.5 35.1 74.2 L10.9 66.8 C8.7 66.1 8.7 63 10.9 62.3 L35.1 54.9 C35.9 54.6 36.5 54 36.8 53.2 L44.4 30.6 Z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="4"
            />
            <path
              d="M68 14 V34 M58 24 H78"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d="M87 34 V48 M80 41 H94"
              strokeLinecap="round"
              strokeWidth="4"
            />
          </svg>
          {audioConnection === 'on' ? (
            <AudioPresence
              type="server"
              height={35}
              width={70}
              barCount={4}
              barSpacing={2}
            />
          ) : null}
        </div>

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
      {showInfoBanner ? (
        <div
          id="header-info-banner"
          role="region"
          aria-label="Assistant information"
          className="relative z-20 w-full shrink-0 bg-[color:var(--mfn-user-nav-avatar-background)] px-6 py-3 font-sans text-md leading-7 text-white shadow-lg sm:px-8"
        >
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
      ) : null}
    </>
  );
});

export { Header };
