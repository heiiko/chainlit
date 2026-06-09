import { cn } from '@/lib/utils';
import { Link, MessageCircle, Volume2 } from 'lucide-react';
import {
  MutableRefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useRecoilValue } from 'recoil';

import {
  ChainlitContext,
  IAction,
  IStarter,
  IStarterWidget,
  IStarterWidgetArticleBriefing,
  IStarterWidgetArticleBriefings,
  sessionIdState
} from '@chainlit/react-client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  getStarterId,
  resolveStarterIconUrl,
  useStarterAction
} from './useStarter';

const COMPACT_STARTER_WIDGET_BREAKPOINT = 380;
const COMPACT_STARTER_WIDGET_LIMIT = 4;
const ARTICLE_BRIEFING_MOBILE_BREAKPOINT = 640;

interface StarterWidgetItemProps {
  autoScrollRef?: MutableRefObject<boolean>;
  starter: IStarter;
}

function StarterWidgetItem({ autoScrollRef, starter }: StarterWidgetItemProps) {
  const { apiClient, disabled, onSubmit } = useStarterAction(
    starter,
    autoScrollRef
  );
  const iconSrc = resolveStarterIconUrl(apiClient, starter.icon);

  return (
    <button
      id={getStarterId(starter.label)}
      type="button"
      disabled={disabled}
      onClick={onSubmit}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      {iconSrc ? (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center">
          <img className="h-16 w-16 rounded-sm" src={iconSrc} alt="" />
        </span>
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm bg-muted">
          <MessageCircle className="h-4 w-4" />
        </span>
      )}
      <span className="font-medium leading-relaxed">{starter.label}</span>
    </button>
  );
}

function setImageUrlParam(imageUrl: string, key: string, value: string) {
  try {
    const url = new URL(imageUrl);
    url.searchParams.set(key, value);
    return url.toString();
  } catch {
    return imageUrl;
  }
}

function getArticleBriefingImageUrl(
  imageUrl: string | undefined,
  isLarge: boolean
) {
  if (!imageUrl) return undefined;
  const ratio = isLarge ? '16/9' : '1/1';
  const width = isLarge ? '1280' : '180';
  return setImageUrlParam(
    setImageUrlParam(imageUrl, 'ratio', ratio),
    'width',
    width
  );
}

function getArticleBriefingTtsText(article: IStarterWidgetArticleBriefing) {
  return [article.headline, '', ...article.bullets].filter(Boolean).join('\n');
}

interface ArticleBriefingCardProps {
  article: IStarterWidgetArticleBriefing;
  articleBriefings: IStarterWidgetArticleBriefings;
  isLarge: boolean;
  index: number;
}

function ArticleBriefingCard({
  article,
  articleBriefings,
  isLarge,
  index
}: ArticleBriefingCardProps) {
  const apiClient = useContext(ChainlitContext);
  const sessionId = useRecoilValue(sessionIdState);
  const [audioLoading, setAudioLoading] = useState(false);
  const labels = articleBriefings.labels || {};
  const imageUrl = getArticleBriefingImageUrl(article.imageUrl, isLarge);
  const listenLabel = labels.listen || 'Read aloud';
  const openLabel = labels.open || 'Full article';

  const playAudio = useCallback(async () => {
    if (!articleBriefings.audioActionName || audioLoading) return;

    const action: IAction = {
      id: `${article.urn || article.headline}-readaloud`,
      forId: '',
      name: articleBriefings.audioActionName,
      label: listenLabel,
      icon: 'volume-2',
      tooltip: listenLabel,
      payload: {
        content: getArticleBriefingTtsText(article),
        query: article.headline
      },
      onClick: () => undefined
    };

    try {
      setAudioLoading(true);
      await apiClient.callAction(action, sessionId);
    } catch (error) {
      console.error('Article briefing audio action failed', error);
    } finally {
      setAudioLoading(false);
    }
  }, [
    apiClient,
    article,
    articleBriefings.audioActionName,
    audioLoading,
    listenLabel,
    sessionId
  ]);

  const copy = (
    <div className="min-w-0 flex flex-col gap-3">
      <h3
        className={cn(
          'm-0 font-serif font-bold text-foreground',
          isLarge ? 'text-[1.95rem] leading-tight' : 'text-lg leading-snug'
        )}
      >
        {article.headline}
      </h3>
      <ul
        className={cn(
          'm-0 list-disc space-y-3 pl-5 text-foreground',
          isLarge
            ? 'text-[1.15rem] leading-relaxed'
            : 'text-[0.98rem] leading-relaxed'
        )}
      >
        {article.bullets.map((bullet) => (
          <li key={bullet} className="pl-1 marker:text-muted-foreground">
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <article className="border-b py-5 text-foreground last:border-b-0 first:pt-0">
      {isLarge ? (
        <>
          {imageUrl ? (
            <img
              className="mb-4 aspect-video w-full rounded-lg bg-muted object-cover"
              src={imageUrl}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ) : null}
          {copy}
        </>
      ) : (
        <div
          className={cn(
            'grid items-start gap-4',
            imageUrl ? 'grid-cols-[minmax(0,1fr)_88px]' : 'grid-cols-1'
          )}
        >
          {copy}
          {imageUrl ? (
            <img
              className="aspect-square w-[88px] rounded-md bg-muted object-cover"
              src={imageUrl}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ) : null}
        </div>
      )}
      <div className="-ml-1.5 mt-4 flex w-full flex-wrap items-center gap-0 font-sans text-sm font-medium text-muted-foreground">
        {articleBriefings.audioActionName ? (
          <button
            type="button"
            aria-label={listenLabel}
            title={listenLabel}
            disabled={audioLoading}
            onClick={playAudio}
            className={cn(
              'inline-flex h-8 w-9 items-center justify-center rounded-[0.625rem] transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            <Volume2 className="h-4 w-4" />
          </button>
        ) : null}
        {article.articleUrl ? (
          <a
            className={cn(
              'ml-3 inline-flex h-8 items-center gap-2 rounded-[0.625rem] px-3 transition-colors',
              'text-muted-foreground no-underline hover:bg-accent hover:text-accent-foreground'
            )}
            href={article.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={openLabel}
          >
            <Link className="h-4 w-4" />
            <span className="truncate">{openLabel}</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

function ArticleBriefingsSection({
  articleBriefings
}: {
  articleBriefings?: IStarterWidgetArticleBriefings;
}) {
  const [isLarge, setIsLarge] = useState(false);
  const articles = articleBriefings?.articles || [];

  useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${ARTICLE_BRIEFING_MOBILE_BREAKPOINT}px)`
    );
    const onChange = () => {
      setIsLarge(mql.matches);
    };

    onChange();
    mql.addEventListener('change', onChange);

    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (!articleBriefings || !articles.length) return null;

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center gap-4 border-b px-4 pt-4 md:gap-10">
        <h2 className="m-0 inline-flex shrink-0 items-center whitespace-nowrap border-b-2 border-foreground px-0 py-2 font-sans text-base font-bold uppercase tracking-normal text-foreground">
          {articleBriefings.title || 'Highlights'}
        </h2>
      </div>
      <div className="px-4 pb-8">
        {articles.map((article, index) => (
          <ArticleBriefingCard
            key={article.urn || `${article.headline}-${index}`}
            article={article}
            articleBriefings={articleBriefings}
            isLarge={isLarge}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

interface Props {
  autoScrollRef?: MutableRefObject<boolean>;
  widget: IStarterWidget;
}

export default function StarterWidget({ autoScrollRef, widget }: Props) {
  const apiClient = useContext(ChainlitContext);
  const tabs = widget.tabs || [];
  const hasArticleBriefings = Boolean(
    widget.articleBriefings?.articles?.length
  );
  const [isCompactScreen, setIsCompactScreen] = useState(false);
  const defaultTab = useMemo(() => {
    if (!tabs.length) return '';
    if (
      widget.initialTab &&
      tabs.some((tab) => tab.key === widget.initialTab)
    ) {
      return widget.initialTab;
    }
    return tabs[0].key;
  }, [tabs, widget.initialTab]);
  const [selectedTab, setSelectedTab] = useState(defaultTab);

  useEffect(() => {
    setSelectedTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${COMPACT_STARTER_WIDGET_BREAKPOINT}px)`
    );
    const onChange = () => {
      setIsCompactScreen(mql.matches);
    };

    onChange();
    mql.addEventListener('change', onChange);

    return () => mql.removeEventListener('change', onChange);
  }, []);

  if (!tabs.length && !hasArticleBriefings) return null;

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden">
      {tabs.length ? (
        <Tabs
          className="w-full"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className={cn(
                  'h-auto rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-sans font-normal uppercase',
                  'data-[state=active]:border-foreground data-[state=active]:bg-transparent',
                  'data-[state=active]:font-bold',
                  'data-[state=active]:shadow-none'
                )}
              >
                <span className="flex items-center gap-2">
                  {tab.icon ? (
                    <img
                      className="h-4 w-4 rounded-sm"
                      src={resolveStarterIconUrl(apiClient, tab.icon)}
                      alt=""
                    />
                  ) : null}
                  {tab.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-0">
              <div className="divide-y">
                {(isCompactScreen
                  ? tab.starters.slice(0, COMPACT_STARTER_WIDGET_LIMIT)
                  : tab.starters
                ).map((starter) => (
                  <StarterWidgetItem
                    autoScrollRef={autoScrollRef}
                    key={starter.label}
                    starter={starter}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : null}
      <ArticleBriefingsSection articleBriefings={widget.articleBriefings} />
    </div>
  );
}
