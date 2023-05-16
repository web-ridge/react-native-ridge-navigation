import * as React from 'react';
import BottomTabRefreshContext from './contexts/BottomTabRefreshContext';

export default function useBottomTabRefresh() {
  return React.useContext(BottomTabRefreshContext).refresh;
}
