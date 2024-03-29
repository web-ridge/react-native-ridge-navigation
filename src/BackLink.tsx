import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import useNavigation from './useNavigation';

interface RenderProps {
  onPress: (e: GestureResponderEvent) => void;
}

function BackLink({ children }: { children: (p: RenderProps) => any }) {
  const { pop } = useNavigation();

  const onPress = React.useCallback(() => {
    // TODO: handle to on android like behaviour when pressing the back button
    pop();
  }, [pop]);

  return children({
    onPress: onPress,
  });
}
export default React.memo(BackLink);
