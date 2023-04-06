import * as React from 'react';
import { ModalContext } from './contexts/ModalContext';
const value = { inModal: true };

export default function ModalBackHandler({ children }: any) {
  const handleBack = React.useCallback(() => false, []);
  return (
    <ModalContext.Provider value={value}>
      {children(handleBack)}
    </ModalContext.Provider>
  );
}
