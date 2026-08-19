export type SelectionHistory = 'replace' | 'push';

export type NavigationHistoryAction = 'add' | 'replace' | 'none';

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
