import type { IMode, IModeOption } from '@chainlit/react-client';

export type ModeValue = string | string[];

type StatefulModeOption = IModeOption & { selected?: boolean };

function getFallbackOption(mode: IMode): IModeOption | undefined {
  return mode.options.find((option) => option.default) || mode.options[0];
}

export function getSelectedOptionIds(mode: IMode): string[] {
  const options = mode.options as StatefulModeOption[];
  const hasExplicitSelection = options.some(
    (option) => option.selected !== undefined
  );
  const selectedOptionIds = options
    .filter((option) =>
      hasExplicitSelection ? option.selected : option.default
    )
    .map(({ id }) => id);

  if (mode.select === 'multi') {
    if (selectedOptionIds.length) return selectedOptionIds;
  } else if (selectedOptionIds[0]) {
    return [selectedOptionIds[0]];
  }

  const fallbackOption = getFallbackOption(mode);
  return fallbackOption ? [fallbackOption.id] : [];
}

export function updateModeSelection(mode: IMode, optionId: string): IMode {
  const selectedOptionIds = getSelectedOptionIds(mode);
  const nextSelectedOptionIds =
    mode.select === 'multi'
      ? selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId]
      : [optionId];

  if (!nextSelectedOptionIds.length) {
    const fallbackOption = getFallbackOption(mode);
    if (fallbackOption) nextSelectedOptionIds.push(fallbackOption.id);
  }

  return {
    ...mode,
    options: mode.options.map((option: IModeOption) => ({
      ...option,
      selected: nextSelectedOptionIds.includes(option.id)
    }))
  };
}

export function getModeValue(mode: IMode): ModeValue | undefined {
  const selectedOptionIds = getSelectedOptionIds(mode);
  if (mode.select === 'multi') return selectedOptionIds;
  return selectedOptionIds[0];
}
