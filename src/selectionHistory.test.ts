import {
  consumePaneApplyIntent,
  resolvePaneBackAction,
  resolveSelectionBackTargetIndex,
  resolveSelectionHistoryAction,
  shouldPreloadMirroredSelection,
} from './selectionHistory';

describe('resolveSelectionHistoryAction', () => {
  it('replaces peer selections by default', () => {
    expect(resolveSelectionHistoryAction('add')).toBe('replace');
  });

  it('lets a split opt into replayable selection history', () => {
    expect(resolveSelectionHistoryAction('add', 'push')).toBe('add');
  });

  it('honours an explicit replace in a push-history split', () => {
    expect(resolveSelectionHistoryAction('replace', 'push')).toBe('replace');
  });
});

describe('resolveSelectionBackTargetIndex', () => {
  it('returns the previous pane selection for a one-step Back', () => {
    expect(resolveSelectionBackTargetIndex(3)).toBe(1);
  });

  it('supports multi-step Back navigation', () => {
    expect(resolveSelectionBackTargetIndex(4, 2)).toBe(1);
  });

  it('falls back to the outer navigator without an earlier selection', () => {
    expect(resolveSelectionBackTargetIndex(1)).toBeNull();
  });
});

describe('resolvePaneBackAction', () => {
  it('consumes the pushed web entry before the following Back leaves the split', () => {
    const entries = ['pipeline', 'supplier:retour', 'supplier:retour/review'];
    let currentIndex = 2;
    const applyBrowserBack = (selectionStackLength: number) => {
      const action = resolvePaneBackAction(selectionStackLength, 1, true);
      expect(action).toEqual({ type: 'browser', distance: 1 });
      if (action.type === 'browser') {
        currentIndex -= action.distance;
      }
    };

    applyBrowserBack(2);
    expect(entries[currentIndex]).toBe('supplier:retour');
    expect(entries).toEqual([
      'pipeline',
      'supplier:retour',
      'supplier:retour/review',
    ]);

    applyBrowserBack(1);
    expect(entries[currentIndex]).toBe('pipeline');
  });

  it('keeps native pane Back synchronous before falling back to the outer navigator', () => {
    expect(resolvePaneBackAction(2)).toEqual({
      type: 'selection',
      targetIndex: 0,
    });
    expect(resolvePaneBackAction(1)).toEqual({
      type: 'outer',
      distance: 1,
    });
  });
});

describe('mirrored pane preload intent', () => {
  it('preloads cold URL, Back and Forward selections', () => {
    expect(shouldPreloadMirroredSelection(null)).toBe(true);
  });

  it('skips the duplicate preload for a local selection exactly once', () => {
    const intentRef = { current: 'replace' as const };

    expect(
      shouldPreloadMirroredSelection(consumePaneApplyIntent(intentRef))
    ).toBe(false);
    expect(intentRef.current).toBeNull();
    expect(
      shouldPreloadMirroredSelection(consumePaneApplyIntent(intentRef))
    ).toBe(true);
  });
});
