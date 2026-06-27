import { cn } from '@/lib/utils';
import { MutableRefObject } from 'react';

import {
  IStarter,
  IStarterWidget,
  IStarterWidgetTab
} from '@chainlit/react-client';

import {
  getStarterId,
  resolveStarterIconUrl,
  useStarterAction
} from './useStarter';

interface StarterButtonProps {
  autoScrollRef?: MutableRefObject<boolean>;
  starter: IStarter;
}

interface StarterWidgetSectionTab extends IStarterWidgetTab {
  heading?: string;
  byline?: string;
  variant?: 'pills' | 'list';
}

function cleanPillLabel(label: string) {
  return label.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

function SectionHeading({
  inverted = false,
  tab
}: {
  inverted?: boolean;
  tab: StarterWidgetSectionTab;
}) {
  const title = tab.heading || tab.label;

  if (!title && !tab.byline) return null;

  return (
    <header className="flex flex-col gap-1">
      {title ? (
        <h2
          className={cn(
            'm-0 font-sans text-[16px] font-bold uppercase leading-[1.25] tracking-normal text-foreground',
            inverted && '!text-white'
          )}
        >
          {title}
        </h2>
      ) : null}
      {tab.byline ? (
        <p
          className={cn(
            'm-0 pb-2 font-sans text-[14px] font-medium leading-[1.35] text-muted-foreground',
            inverted && '!text-white'
          )}
        >
          {tab.byline}
        </p>
      ) : null}
    </header>
  );
}

function StarterPill({ autoScrollRef, starter }: StarterButtonProps) {
  const { disabled, onSubmit } = useStarterAction(starter, autoScrollRef);

  return (
    <button
      id={getStarterId(starter.label)}
      type="button"
      disabled={disabled}
      onClick={onSubmit}
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-[999px] border border-[color:var(--mfn-starter-widget-pill-background,rgb(87,152,252))] bg-[color:var(--mfn-starter-widget-pill-background,rgb(87,152,252))] px-[15px] py-2.5 font-sans text-[14px] font-medium leading-none text-white transition-colors',
        'hover:border-[color:var(--mfn-starter-widget-pill-background,rgb(87,152,252))] hover:bg-[color:var(--mfn-starter-widget-pill-background,rgb(87,152,252))] hover:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      <span className="whitespace-nowrap text-[13px] font-bold uppercase">
        {cleanPillLabel(starter.label)}
      </span>
    </button>
  );
}

function QuestionStarter({ autoScrollRef, starter }: StarterButtonProps) {
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
        'grid w-full grid-cols-[54px_minmax(0,1fr)] items-center gap-5 border-b py-3 text-left transition-colors first:border-t last:border-b-0',
        'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      {iconSrc ? (
        <img
          className="h-[54px] w-[54px] rounded-[9px] bg-muted object-cover"
          src={iconSrc}
          alt=""
          loading="lazy"
        />
      ) : (
        <span
          aria-hidden="true"
          className="h-[54px] w-[54px] rounded-[9px] bg-[repeating-linear-gradient(135deg,#eef1f4_0,#eef1f4_0.85rem,#e8ecef_0.85rem,#e8ecef_1.7rem)]"
        />
      )}
      <span className="font-serif text-[16px] leading-[1.38] text-foreground">
        {starter.label}
      </span>
    </button>
  );
}

function PillSection({
  autoScrollRef,
  tab
}: {
  autoScrollRef?: MutableRefObject<boolean>;
  tab: StarterWidgetSectionTab;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[20px] bg-[color:var(--mfn-starter-widget-box-background,rgb(73,129,251))] p-4 !text-white shadow-[0_18px_30px_-22px_var(--mfn-starter-widget-shadow-strong,rgba(14,42,76,0.85)),0_8px_16px_-12px_var(--mfn-starter-widget-shadow-soft,rgba(14,42,76,0.45))]">
      <SectionHeading inverted tab={tab} />
      <div className="-mx-4 flex gap-[10px] overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tab.starters.map((starter) => (
          <StarterPill
            autoScrollRef={autoScrollRef}
            key={starter.label}
            starter={starter}
          />
        ))}
      </div>
    </section>
  );
}

function QuestionSection({
  autoScrollRef,
  tab
}: {
  autoScrollRef?: MutableRefObject<boolean>;
  tab: StarterWidgetSectionTab;
}) {
  return (
    <section className="flex flex-col gap-2">
      <SectionHeading tab={tab} />
      <div>
        {tab.starters.map((starter) => (
          <QuestionStarter
            autoScrollRef={autoScrollRef}
            key={starter.label}
            starter={starter}
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
  const tabs = (widget.tabs || []).filter(
    (tab) => tab.starters.length
  ) as StarterWidgetSectionTab[];

  if (!tabs.length) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-7 overflow-hidden px-4 py-2">
      {tabs.map((tab, index) => {
        const section =
          tab.variant === 'pills' ? (
            <PillSection autoScrollRef={autoScrollRef} tab={tab} />
          ) : (
            <QuestionSection autoScrollRef={autoScrollRef} tab={tab} />
          );

        return (
          <div key={tab.key} className={cn(index > 0 && 'pt-2')}>
            {section}
          </div>
        );
      })}
    </div>
  );
}
