import * as React from 'react';

export type NativeNavigationSearch = {
  onChangeText?: (text: string) => void;
  placeholder?: string;
  text?: string;
};

/** TypeScript/web fallback; native platforms resolve the sibling .native file. */
export default function NativeNavigationBar({
  children,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  search?: NativeNavigationSearch;
}) {
  return <>{children}</>;
}
