import { StateNavigator } from 'navigation';
import {
  buildReplaceUrl,
  isPaneNavigatorProxy,
  paneNavigatorProxyKey,
} from './replaceUrl';

function createNavigator() {
  return new StateNavigator([
    { key: 'list', route: 'list' },
    { key: 'detail', route: 'detail/{id}', trackCrumbTrail: true },
  ]);
}

function replace(navigator: StateNavigator, id: string) {
  navigator.navigateLink(
    buildReplaceUrl(navigator, 'detail', { id }),
    'replace'
  );
}

function crumbIds(navigator: StateNavigator) {
  return navigator.stateContext.crumbs.map(
    (crumb) => `${crumb.state.key}:${crumb.data.id ?? ''}`
  );
}

describe('buildReplaceUrl', () => {
  it('replaces the current scene without adding it as a crumb', () => {
    const navigator = createNavigator();
    navigator.navigate('detail', { id: '13' });
    replace(navigator, '12');
    expect(navigator.stateContext.data.id).toBe('12');
    expect(crumbIds(navigator)).toEqual([]);
    expect(navigator.stateContext.url).not.toContain('crumb');
  });

  it('keeps the existing crumb trail when paging back and forth', () => {
    const navigator = createNavigator();
    navigator.navigate('list');
    navigator.navigate('detail', { id: '13' });
    replace(navigator, '12');
    replace(navigator, '13');
    replace(navigator, '14');
    expect(navigator.stateContext.data.id).toBe('14');
    expect(crumbIds(navigator)).toEqual(['list:']);
  });

  it('documents the bug: navigate with replace turns the current scene into a crumb', () => {
    const navigator = createNavigator();
    navigator.navigate('detail', { id: '13' });
    navigator.navigate('detail', { id: '12' }, 'replace');
    expect(crumbIds(navigator)).toEqual(['detail:13']);
  });
});

describe('isPaneNavigatorProxy', () => {
  it('recognises a marked split-view proxy', () => {
    const navigator = createNavigator();
    const proxy = new Proxy(navigator, {
      get(target: any, prop) {
        if (prop === paneNavigatorProxyKey) {
          return true;
        }
        return target[prop];
      },
    });
    expect(isPaneNavigatorProxy(proxy)).toBe(true);
    expect(isPaneNavigatorProxy(navigator)).toBe(false);
  });
});
