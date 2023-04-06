import * as React from 'react';
import { ModalContext } from './contexts/ModalContext';

export default function useModal() {
  const { inModal } = React.useContext(ModalContext);
  return { inModal };
}
