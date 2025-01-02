import { StyleSheet, ScrollView as NativeScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
  safeAreaView: {
    flex: 1,
  },
});

export function ScreenWrapperInner({
  children,
  top,
  bottom,
}: {
  children: any;
  top?: boolean;
  bottom?: boolean;
}) {
  return (
    <SafeAreaView
      style={styles.safeAreaView}
      edges={
        [
          'right',
          'left',
          top ? 'top' : undefined,
          bottom ? 'bottom' : undefined,
        ].filter((n) => n) as any[]
      }
    >
      {children}
    </SafeAreaView>
  );
}

export default function ScreenWrapper({
  ScrollView,
  ...rest
}: {
  children: any;
  top?: boolean;
  bottom?: boolean;
  ScrollView?: any;
}) {
  const Scroller = ScrollView || NativeScrollView;
  return (
    <Scroller
      testID="screen-wrapper"
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainerStyle}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
    >
      <ScreenWrapperInner {...rest} />
    </Scroller>
  );
}
