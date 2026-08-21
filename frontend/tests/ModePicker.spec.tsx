import { getSelectedOptionIds, updateModeSelection } from '@/lib/modeSelection';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { ChainlitContext, IMode } from '@chainlit/react-client';

import ModePicker from '@/components/chat/MessageComposer/ModePicker';

const options = [
  { id: 'web', name: 'Web', icon: 'https://example.com/web.svg' },
  {
    id: 'archive',
    name: 'Archive',
    icon: 'https://example.com/archive.svg'
  }
];

beforeAll(() => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  }));
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

function ModePickerHarness({
  select,
  tooltip
}: {
  select?: 'single' | 'multi';
  tooltip?: string;
}) {
  const [mode, setMode] = useState<IMode>({
    id: 'sources',
    name: 'Sources',
    options,
    select,
    tooltip
  });

  return (
    <ChainlitContext.Provider value={{ buildEndpoint: (path) => path } as any}>
      <ModePicker
        mode={mode}
        selectedOptionIds={getSelectedOptionIds(mode)}
        onOptionSelect={(_, optionId) =>
          setMode((current) => updateModeSelection(current, optionId))
        }
      />
    </ChainlitContext.Provider>
  );
}

describe('ModePicker', () => {
  it('renders mode help with the shared tooltip system', async () => {
    render(<ModePickerHarness tooltip="Choose one or more sources" />);

    const trigger = screen.getByRole('button', { name: 'Sources' });
    fireEvent.focus(trigger);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Choose one or more sources'
    );

    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Web' })).toBeInTheDocument();
  });

  it('keeps the picker open while toggling multiple selections', () => {
    render(<ModePickerHarness select="multi" />);

    fireEvent.click(screen.getByRole('button', { name: 'Sources' }));
    fireEvent.click(screen.getByRole('option', { name: 'Archive' }));

    const trigger = screen.getByRole('button', { name: 'Sources' });
    expect(screen.getByRole('option', { name: 'Archive' })).toBeInTheDocument();
    expect(trigger.querySelectorAll('img')).toHaveLength(2);
    expect(trigger).toContainHTML('https://example.com/web.svg');
    expect(trigger).toContainHTML('https://example.com/archive.svg');
  });

  it('does not allow the final multi selection to be cleared', () => {
    render(<ModePickerHarness select="multi" />);

    fireEvent.click(screen.getByRole('button', { name: 'Sources' }));
    fireEvent.click(screen.getByRole('option', { name: 'Web' }));

    const trigger = screen.getByRole('button', { name: 'Sources' });
    expect(trigger.querySelectorAll('img')).toHaveLength(1);
    expect(trigger).toContainHTML('https://example.com/web.svg');
    expect(screen.getByRole('option', { name: 'Web' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('keeps the existing single-select behavior by default', () => {
    render(<ModePickerHarness />);

    fireEvent.click(screen.getByRole('button', { name: 'Sources' }));
    fireEvent.click(screen.getByRole('option', { name: 'Archive' }));

    const trigger = screen.getByRole('button', { name: 'Sources' });
    expect(trigger.querySelectorAll('img')).toHaveLength(1);
    expect(trigger).toContainHTML('https://example.com/archive.svg');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });
});
