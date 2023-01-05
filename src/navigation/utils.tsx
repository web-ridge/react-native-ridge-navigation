import * as React from 'react';
import { NavigationContext } from 'navigation-react';
import { StateNavigator } from 'navigation';

export function copyStateNavigator(
  stateNavigator: StateNavigator,
  key: string
) {
  const navigator = new StateNavigator(stateNavigator);
  navigator.start(key);
  return navigator;
}

export function useCopiedStateNavigator(key: string) {
  const { stateNavigator } = React.useContext(NavigationContext);
  return React.useRef(copyStateNavigator(stateNavigator, key)).current;
}
