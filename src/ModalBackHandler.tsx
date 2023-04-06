import * as React from 'react';
import {
  ModalBackHandler,
  ModalBackHandlerProps,
} from 'navigation-react-native';
import { ModalContext } from './contexts/ModalContext';

const value = { inModal: true };
export default (props: ModalBackHandlerProps) => (
  <ModalContext.Provider value={value}>
    <ModalBackHandler {...props} />
  </ModalContext.Provider>
);
