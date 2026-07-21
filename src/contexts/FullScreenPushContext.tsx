import * as React from 'react';
import type { BaseScreen } from '../navigationUtils';

/**
 * Lets a push escape a SplitView / TripleSplitView and present FULL-SCREEN over
 * the whole split — its own native screen at full width — instead of landing in
 * the detail pane. Contacts "Wijzig" / a compose flow.
 *
 * A split provides this with a function that pushes on the MAIN navigator (the
 * one the split itself lives in), so the pushed screen is a real native
 * full-screen push with a back that returns to the split. Outside a split it is
 * null and `fullScreen` links fall back to a normal push.
 *
 * On web the main navigator is the single history-backed StateNavigator, so a
 * full-screen push is just a normal full-screen route (URL changes) — matching
 * native.
 */
export type FullScreenPush = (
  screen: BaseScreen,
  params: any,
  options?: { preload?: boolean }
) => void;

const FullScreenPushContext = React.createContext<FullScreenPush | null>(null);

export function useFullScreenPush(): FullScreenPush | null {
  return React.useContext(FullScreenPushContext);
}

export default FullScreenPushContext;
