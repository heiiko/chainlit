import { cn } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';
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

function SectionHeading({ tab }: { tab: StarterWidgetSectionTab }) {
  const title = tab.heading || tab.label;

  if (!title && !tab.byline) return null;

  return (
    <header className="flex flex-col gap-2">
      {title ? (
        <h2 className="m-0 font-sans text-[1.35rem] font-bold uppercase leading-tight tracking-normal text-foreground md:text-[1.55rem]">
          {title}
        </h2>
      ) : null}
      {tab.byline ? (
        <p className="m-0 font-sans text-[1.1rem] font-semibold leading-snug text-muted-foreground md:text-[1.35rem]">
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
        'inline-flex h-[3.8rem] shrink-0 items-center gap-4 rounded-full border border-border bg-background px-7 font-sans text-lg font-bold text-foreground transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
    >
      <MessageCircle className="h-5 w-5 shrink-0 text-[#007d80]" />
      <span className="whitespace-nowrap">
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
        'grid w-full grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-6 border-b py-5 text-left transition-colors last:border-b-0',
        'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50 md:grid-cols-[5.4rem_minmax(0,1fr)] md:gap-8 md:py-6'
      )}
    >
      {iconSrc ? (
        <img
          className="aspect-square w-full rounded-xl bg-muted object-cover"
          src={iconSrc}
          alt=""
          loading="lazy"
        />
      ) : (
        <span
          aria-hidden="true"
          className="aspect-square w-full rounded-xl bg-[repeating-linear-gradient(135deg,#eef1f4_0,#eef1f4_0.85rem,#e8ecef_0.85rem,#e8ecef_1.7rem)]"
        />
      )}
      <span className="font-serif text-[1.45rem] font-bold leading-tight text-foreground md:text-[1.8rem]">
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
    <section className="flex flex-col gap-8">
      <SectionHeading tab={tab} />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
    <section className="flex flex-col gap-6">
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-9 overflow-hidden px-4 py-2">
      {tabs.map((tab, index) => {
        const section =
          tab.variant === 'pills' ? (
            <PillSection autoScrollRef={autoScrollRef} tab={tab} />
          ) : (
            <QuestionSection autoScrollRef={autoScrollRef} tab={tab} />
          );

        return (
          <div key={tab.key} className={cn(index > 0 && 'border-t pt-9')}>
            {section}
          </div>
        );
      })}
    </div>
  );
}
