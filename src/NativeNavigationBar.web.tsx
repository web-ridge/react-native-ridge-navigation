import * as React from 'react';

export type NativeNavigationSearch = {
  onChangeText?: (text: string) => void;
  placeholder?: string;
  text?: string;
};

/** Web keeps the application's own shell and header chrome. */
export default function NativeNavigationBar({
  children,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  search?: NativeNavigationSearch;
}) {
  return <>{children}</>;
}
