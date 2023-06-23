import type { StateNavigator } from 'navigation';
import ReactDOM from 'react-dom';

// this fixes flashes on safari iOS when going back
export default function fixConcurrent(stateNavigator: StateNavigator) {
  const _navigateLink = stateNavigator.navigateLink;
  stateNavigator.navigateLink = (...args) => {
    const history = args[2];
    console.log({ history });
    const flush = !history
      ? (callback: () => void) => callback()
      : ReactDOM.flushSync;
    flush(() => {
      _navigateLink.apply(stateNavigator, args);
    });
  };
  return stateNavigator;
}
