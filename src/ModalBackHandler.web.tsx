import * as React from 'react';
export default function ModalBackHandler({ children }: any) {
  const handleBack = React.useCallback(() => false, []);
  return children(handleBack);
}
