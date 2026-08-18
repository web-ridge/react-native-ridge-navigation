export type SelectionHistory = 'replace' | 'push';

export type NavigationHistoryAction = 'add' | 'replace' | 'none';

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
