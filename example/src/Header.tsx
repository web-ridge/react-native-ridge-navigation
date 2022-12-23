import * as React from 'react';
import { Appbar } from 'react-native-paper';
import { BackLink } from 'react-native-ridge-navigation';

function Header({ title, withBack }: { title: string; withBack?: boolean }) {
  return (
    <Appbar.Header mode="small" elevated>
      {withBack ? (
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
