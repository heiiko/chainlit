import { describe, expect, it } from 'vitest';

import {
  getModeValue,
  getSelectedOptionIds,
  updateModeSelection
} from '../src/lib/modeSelection';

describe('mode selection', () => {
  it('keeps single select as the default and falls back to the first option', () => {
    const mode = {
      id: 'model',
      name: 'Model',
      options: [
        { id: 'fast', name: 'Fast' },
        { id: 'smart', name: 'Smart' }
      ]
    };

    expect(getModeValue(mode)).toBe('fast');
    expect(getModeValue(updateModeSelection(mode, 'smart'))).toBe('smart');
  });

  it('toggles multiple options independently for multi select modes', () => {
    const mode = {
      id: 'sources',
      name: 'Sources',
      select: 'multi' as const,
      options: [
        { id: 'web', name: 'Web', default: true },
        { id: 'archive', name: 'Archive' },
        { id: 'podcasts', name: 'Podcasts' }
      ]
    };

    const withArchive = updateModeSelection(mode, 'archive');
    expect(getSelectedOptionIds(withArchive)).toEqual(['web', 'archive']);
    expect(getModeValue(withArchive)).toEqual(['web', 'archive']);

    const withoutWeb = updateModeSelection(withArchive, 'web');
    expect(getModeValue(withoutWeb)).toEqual(['archive']);

    const withoutArchive = updateModeSelection(withoutWeb, 'archive');
    expect(getModeValue(withoutArchive)).toEqual(['web']);
  });

  it('falls back to the first option when a multi select mode has no default', () => {
    const mode = {
      id: 'sources',
      name: 'Sources',
      select: 'multi' as const,
      options: [{ id: 'web', name: 'Web' }]
    };

    expect(getModeValue(mode)).toEqual(['web']);
  });

  it('restores a configured default rather than leaving multi select empty', () => {
    const mode = {
      id: 'sources',
      name: 'Sources',
      select: 'multi' as const,
      options: [
        { id: 'web', name: 'Web' },
        { id: 'archive', name: 'Archive', default: true }
      ]
    };

    const cleared = updateModeSelection(mode, 'archive');
    expect(getModeValue(cleared)).toEqual(['archive']);
  });
});
