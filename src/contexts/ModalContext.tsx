import * as React from 'react';

export const ModalContext = React.createContext<{
  inModal: boolean;
  // onRequestClose: () => {};
}>({
  inModal: false,
  // onRequestClose: () => {},
});
