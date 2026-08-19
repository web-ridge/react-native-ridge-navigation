export type SelectionHistory = 'replace' | 'push';

export type NavigationHistoryAction = 'add' | 'replace' | 'none';

export type PaneApplyIntent = 'replace' | 'push' | null;

export type PaneBackAction =
  | { type: 'browser'; distance: number }
  | { type: 'selection'; targetIndex: number }
  | { type: 'outer'; distance: number };

/**
 * Pane selections initiated locally already ran their screen preload before
 * updating the URL. Consume that one-shot intent when the URL mirror catches
 * up, so a later external URL/Back/Forward change is treated as cold again.
 */
export function consumePaneApplyIntent(intentRef: {
  current: PaneApplyIntent;
}): PaneApplyIntent {
  const intent = intentRef.current;
  intentRef.current = null;
  return intent;
}

export function shouldPreloadMirroredSelection(
  intent: PaneApplyIntent
): boolean {
  return intent == null;
}

/**
 * Returns the earlier URL-backed pane selection for an in-app Back action.
 * An index (rather than the value) is returned because `undefined` is itself a
 * valid SplitView snapshot: it represents the empty detail placeholder.
 */
export function resolveSelectionBackTargetIndex(
  stackLength: number,
  distance = 1
): number | null {
  const targetIndex = stackLength - 1 - distance;
  return targetIndex >= 0 ? targetIndex : null;
}

/**
 * Web pane selections are real browser-history entries. Back must consume the
 * current entry instead of replacing it with the previous selection; replacing
 * turns `[detail, review]` into `[detail, detail]` and makes the next Back a
 * no-op. Native has no browser timeline, so it keeps the synchronous selection
 * refresh before falling back to the outer navigator.
 */
export function resolvePaneBackAction(
  stackLength: number,
  distance = 1,
  useBrowserHistory = false
): PaneBackAction {
  if (useBrowserHistory) {
    return { type: 'browser', distance };
  }

  const targetIndex = resolveSelectionBackTargetIndex(stackLength, distance);
  return targetIndex == null
    ? { type: 'outer', distance }
    : { type: 'selection', targetIndex };
}

/**
 * A peer selection is not a drill-down step. Split views therefore replace the
 * current browser/native history entry by default, while still allowing a
 * workspace to opt into replayable selection history.
 *
 * An explicit replace always wins so a row can collapse an intermediate step
 * even when its enclosing split opted into push history.
 */
export function resolveSelectionHistoryAction(
  historyAction: NavigationHistoryAction | undefined,
  selectionHistory: SelectionHistory = 'replace'
): 'add' | 'replace' {
  if (historyAction === 'replace' || selectionHistory === 'replace') {
    return 'replace';
  }
  return 'add';
}
