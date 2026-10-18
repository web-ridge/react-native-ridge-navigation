import {
  consumePaneApplyIntent,
  resolvePaneBackAction,
  resolveSelectionBackTargetIndex,
  resolveSelectionHistoryAction,
  shouldPreloadMirroredSelection,
  stepPaneDrillBack,
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

  it.each([
    ['web', true],
    ['native', false],
  ])(
    'clears a selection that replaced its predecessor on %s instead of leaving the split',
    (_platform, useBrowserHistory) => {
      expect(resolvePaneBackAction(1, 1, useBrowserHistory, true)).toEqual({
        type: 'deselect',
      });
    }
  );
});

describe('stepPaneDrillBack', () => {
  const paneWithCrumbs = (crumbs: number, guardAllows = true) => {
    const pane: any = {
      stateContext: { crumbs: new Array(crumbs).fill({}) },
      navigateBack: jest.fn((distance: number) => {
        if (guardAllows) {
          pane.stateContext = { crumbs: new Array(crumbs - distance).fill({}) };
        }
      }),
    };
    return pane;
  };

  it('steps a drill synchronously before the browser entry is consumed', () => {
    const pane = paneWithCrumbs(2);
    expect(stepPaneDrillBack(pane, 1)).toBe(true);
    expect(pane.navigateBack).toHaveBeenCalledWith(1);
  });

  it('keeps the browser entry when a guard keeps the screen', () => {
    expect(stepPaneDrillBack(paneWithCrumbs(2, false), 1)).toBe(false);
  });

  it('leaves a selection without a drill to the URL mirror', () => {
    const pane = paneWithCrumbs(1);
    expect(stepPaneDrillBack(pane, 1)).toBe(true);
    expect(pane.navigateBack).not.toHaveBeenCalled();
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
