import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

import { useChatSession, useConfig } from '@chainlit/react-client';

import Starter from './Starter';
import StarterCategory from './StarterCategory';
import StarterWidget from './StarterWidget';

interface Props {
  className?: string;
}

export default function Starters({ className }: Props) {
  const { chatProfile } = useChatSession();
  const { config } = useConfig();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const selectedChatProfile = useMemo(() => {
    if (!chatProfile) return undefined;
    return config?.chatProfiles.find((profile) => profile.name === chatProfile);
  }, [config, chatProfile]);

  const starterWidget = useMemo(() => {
    if (selectedChatProfile?.starterWidget) {
      return selectedChatProfile.starterWidget;
    }

    if (selectedChatProfile?.starters?.length) {
      return undefined;
    }

    return config?.starterWidget;
  }, [config, selectedChatProfile]);

  const starters = useMemo(() => {
    if (selectedChatProfile?.starterWidget) {
      return undefined;
    }

    if (selectedChatProfile?.starters) {
      return selectedChatProfile.starters;
    }

    if (config?.starterWidget) {
      return undefined;
    }

    return config?.starters;
  }, [config, selectedChatProfile]);

  const starterCategories = starterWidget
    ? undefined
    : config?.starterCategories;

  if (starterWidget?.tabs?.length) {
    return (
      <div id="starters" className={cn('flex w-full', className)}>
        <StarterWidget widget={starterWidget} />
      </div>
    );
  }

  if (starterCategories?.length) {
    const selectedCategoryData = starterCategories.find(
      (cat) => cat.label === selectedCategory
    );

    return (
      <div
        id="starters"
        className={cn('flex w-full justify-center', className)}
      >
        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-2 justify-center flex-wrap">
            {starterCategories.map((category) => (
              <StarterCategory
                key={category.label}
                category={category}
                isSelected={selectedCategory === category.label}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.label ? null : category.label
                  )
                }
              />
            ))}
          </div>
          {selectedCategoryData?.starters?.length && (
            <div className="flex gap-2 justify-center flex-wrap">
              {selectedCategoryData.starters.map((starter) => (
                <Starter key={starter.label} starter={starter} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!starters?.length) return null;

  return (
    <div id="starters" className={cn('flex w-full justify-center', className)}>
      <div className="flex gap-2 justify-center flex-wrap">
        {starters.map((starter, i) => (
          <Starter key={i} starter={starter} />
        ))}
      </div>
    </div>
  );
}
