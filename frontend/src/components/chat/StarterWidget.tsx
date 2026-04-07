import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
import { useContext, useEffect, useMemo, useState } from 'react';

import {
  ChainlitContext,
  IStarter,
  IStarterWidget
} from '@chainlit/react-client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  getStarterId,
  resolveStarterIconUrl,
  useStarterAction
} from './useStarter';

interface StarterWidgetItemProps {
  starter: IStarter;
}

function StarterWidgetItem({ starter }: StarterWidgetItemProps) {
  const { apiClient, disabled, onSubmit } = useStarterAction(starter);
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
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        {iconSrc ? (
          <img className="h-4 w-4 rounded-sm" src={iconSrc} alt="" />
        ) : (
          <MessageCircle className="h-4 w-4" />
        )}
      </span>
      <span className="text-sm font-medium leading-relaxed">
        {starter.label}
      </span>
    </button>
  );
}

interface Props {
  widget: IStarterWidget;
}

export default function StarterWidget({ widget }: Props) {
  const apiClient = useContext(ChainlitContext);
  const tabs = widget.tabs || [];
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

  if (!tabs.length) return null;

  const headerLogo = resolveStarterIconUrl(apiClient, widget.header?.logo);

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border bg-card text-card-foreground shadow-sm">
      {widget.header?.title || widget.header?.subtitle || headerLogo ? (
        <div className="flex items-center gap-4 border-b px-4 py-5">
          {headerLogo ? (
            <img
              className="h-12 w-12 shrink-0 rounded-full object-cover"
              src={headerLogo}
              alt=""
            />
          ) : null}
          <div className="min-w-0">
            {widget.header?.title ? (
              <p className="text-base font-semibold">{widget.header.title}</p>
            ) : null}
            {widget.header?.subtitle ? (
              <p className="text-sm text-muted-foreground">
                {widget.header.subtitle}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

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
                'h-auto rounded-none border-b-2 border-transparent px-4 py-3 text-sm',
                'data-[state=active]:border-foreground data-[state=active]:bg-transparent',
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
              {tab.starters.map((starter) => (
                <StarterWidgetItem key={starter.label} starter={starter} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
