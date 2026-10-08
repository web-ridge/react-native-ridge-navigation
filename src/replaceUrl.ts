import type { StateNavigator } from 'navigation';

// Split-view proxies answer `true` for this key. Their `navigate()` keeps the
// selected detail a pure function of the main URL, so a replace inside a pane
// must go through that proxy instead of a locally built link.
export const paneNavigatorProxyKey = '__ridgePaneNavigatorProxy';

export function isPaneNavigatorProxy(stateNavigator: StateNavigator): boolean {
  return (stateNavigator as any)[paneNavigatorProxyKey] === true;
}

// The URL that replaces the current scene: the crumb trail stays exactly as
// it is and only the current state changes.
//
// `navigate(key, data, 'replace')` only replaces the browser history entry —
// the navigator still pushes the current scene onto the crumb trail
// (`/b?crumb=/a`). Paging back and forth with replace (a → b → a) then
// navigates to a state that is already a crumb, and on web the stack keeps
// showing the previous scene while the URL already points at the new one.
export function buildReplaceUrl(
  stateNavigator: StateNavigator,
  stateKey: string,
  data: any
): string {
  const { crumbs } = stateNavigator.stateContext;
  let fluent = stateNavigator.fluent();
  for (const crumb of crumbs) {
    fluent = fluent.navigate(crumb.state.key, crumb.data);
  }
  return fluent.navigate(stateKey, data).url;
}
