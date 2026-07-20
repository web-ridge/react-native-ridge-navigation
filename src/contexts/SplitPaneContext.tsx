import * as React from 'react';

/**
 * True for screens rendered inside a split/triple pane (e.g. TripleSplitView's
 * middle column). Entity list screens read this to render list-only — dropping
 * their own nested SplitView — so their row pushes flow into the OUTER detail
 * pane instead of creating a split-inside-a-split.
 */
const SplitPaneContext = React.createContext<boolean>(false);

export function useIsInsideSplitPane(): boolean {
  return React.useContext(SplitPaneContext);
}

export default SplitPaneContext;
