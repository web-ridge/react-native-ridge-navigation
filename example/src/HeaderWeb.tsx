import type { BottomTabOverrideProps } from 'react-native-ridge-navigation';
import { Button, Text, IconButton, useTheme } from 'react-native-paper';
import { View } from 'react-native';
import { BottomTabLink } from 'react-native-ridge-navigation';

import { BottomRoot } from './Navigator';

export default function HeaderWeb({
  orientation,
  originalBottomTabs,
  children,
}: BottomTabOverrideProps) {
  const theme = useTheme();
  if (orientation === 'horizontal') {
    return (
      <>
        <View
          style={{
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            flexDirection: 'row',
            paddingTop: 12,
            paddingBottom: 12,
            elevation: 4,
            justifyContent: 'space-between',
            paddingHorizontal: 24,
          }}
        >
          <Text style={{ color: theme.colors.onBackground, fontSize: 22 }}>
            Logo
          </Text>
          <BottomTabLink to={BottomRoot.Home} params={{}}>
            {({ isSelected, ...linkProps }) => (
              <Button {...linkProps}>
                <Text
                  style={{ color: isSelected ? theme.colors.primary : '#ccc' }}
                >
                  Home
                </Text>
              </Button>
            )}
          </BottomTabLink>
          <BottomTabLink to={BottomRoot.Posts} params={{}}>
            {({ isSelected, ...linkProps }) => (
              <Button {...linkProps}>
                <Text
                  style={{ color: isSelected ? theme.colors.primary : '#ccc' }}
                >
                  Posts
                </Text>
              </Button>
            )}
          </BottomTabLink>
          <View>
            <BottomTabLink to={BottomRoot.Account} params={{}}>
              {({ isSelected, ...linkProps }) => (
                <IconButton
                  {...linkProps}
                  icon="account"
                  iconColor={isSelected ? theme.colors.primary : '#000'}
                />
              )}
            </BottomTabLink>
          </View>
        </View>

        <View style={{ flex: 1 }}>{children}</View>
      </>
    );
  }
  return <>{originalBottomTabs}</>;
}
