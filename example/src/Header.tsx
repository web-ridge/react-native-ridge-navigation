import * as React from 'react';
import { Appbar } from 'react-native-paper';

import { BackLink } from '../../src';
import { useColorScheme } from 'react-native';

function Header({ title, withBack }: { title: string; withBack?: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Appbar.Header
      dark={isDark}
      style={{ backgroundColor: 'transparent', elevation: 0 }}
    >
      {withBack ? (
        <BackLink>
          {(linkProps) => (
            <Appbar.BackAction
              {...linkProps}
              color={isDark ? '#fff' : '#000'}
            />
          )}
        </BackLink>
      ) : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
export default React.memo(Header);
