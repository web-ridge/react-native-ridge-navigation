import * as React from 'react';
import { Appbar } from 'react-native-paper';
import {
  BackLink,
  useModal,
  useNavigation,
} from 'react-native-ridge-navigation';
import { Platform } from 'react-native';

function Header({ title }: { title: string }) {
  const { canNavigateBack } = useNavigation();
  const { inModal } = useModal();
  const statusBarHeight = inModal && Platform.OS === 'ios' ? 0 : undefined;
  return (
    <Appbar.Header mode="small" elevated statusBarHeight={statusBarHeight}>
      {canNavigateBack(1) ? (
        <BackLink>
          {(linkProps) => (
            // @ts-ignore
            <Appbar.BackAction
              {...linkProps}
              // color={isDark ? "#fff" : "#000"}
            />
          )}
        </BackLink>
      ) : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
export default React.memo(Header);
