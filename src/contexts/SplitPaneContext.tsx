import * as React from 'react';

/**
 * Which column of a wide SplitView / TripleSplitView the tree is rendering in.
 *
 * - `master` — list / middle column (and SplitView master). Entity lists drop
 *   nested SplitViews so row pushes land in the outer detail column. Product
 *   headers should not auto-show Back here: selection history is owned by the
 *   detail column so master+detail never both paint “Back”.
 * - `detail` — detail column. Nested screens and the selected entity keep
 *   automatic Back when the stack can pop.
 * - `null` — not inside a wide split (full-screen / narrow breakpoint).
 */
export type SplitPaneRole = 'master' | 'detail';

const SplitPaneContext = React.createContext<SplitPaneRole | null>(null);

/** Current split column role, or `null` outside a wide split. */
export function useSplitPaneRole(): SplitPaneRole | null {
  return React.useContext(SplitPaneContext);
}

/**
 * True for the list/master column of a wide split (SplitView master or
 * TripleSplitView middle). Used to render list-only (no nested SplitView).
 *
 * Prefer `useSplitPaneRole()` when you need to distinguish master vs detail.
 */
export function useIsInsideSplitPane(): boolean {
  return React.useContext(SplitPaneContext) === 'master';
}

export default SplitPaneContext;
