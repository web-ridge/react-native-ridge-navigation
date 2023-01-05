import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { BackLink, useNavigation } from 'react-native-ridge-navigation';

function Header({ title }: { title: string }) {
  const { canNavigateBack } = useNavigation();
  return (
    <Appbar.Header mode="small" elevated>
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
