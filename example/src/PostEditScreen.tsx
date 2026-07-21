import * as React from 'react';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import {
  BarButton,
  NavigationBar,
  RightBar,
  useNavigation,
  useParams,
  usePreloadResult,
} from 'react-native-ridge-navigation';
import { useSuspenseQuery } from '@tanstack/react-query';
import { queryKeyPostScreen, queryKeyPostScreenPromise } from './queryKeys';
import routes from './Routes';
import { useRenderLog } from './helpers/utils';
import Text from './ui/Text';
import { radii, useTheme } from './ui/theme';

/**
 * Demo G — a FULL-SCREEN edit screen. It is reached from inside the SplitView
 * detail pane via a `fullScreen` Link, so it presents over the WHOLE split (its
 * own native screen at full width) with a real native back to the split.
 */
function PostEditScreen() {
  useRenderLog('PostEditScreen');
  const theme = useTheme();
  const queryReference = usePreloadResult(routes.PostEditScreen);
  const { id } = useParams(routes.PostEditScreen);
  const { pop } = useNavigation();
  const { data } = useSuspenseQuery({
    queryKey: queryKeyPostScreen({ id }),
    queryFn: queryKeyPostScreenPromise({ id }),
  });
  const [title, setTitle] = React.useState(data?.title ?? '');
  const [body, setBody] = React.useState(data?.body ?? '');

  if (queryReference !== 'testQueryReference') {
    return <Text style={styles.error}>No preloaded result</Text>;
  }

  return (
    <>
      <NavigationBar
        hidden={false}
        title="Wijzig"
        largeTitle={false}
        backTitle="Post"
      >
        <RightBar>
          <BarButton testID="editDone" systemItem="done" onPress={() => pop()} />
        </RightBar>
      </NavigationBar>
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text muted variant="caption" style={styles.label}>
          TITLE
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        />
        <Text muted variant="caption" style={styles.label}>
          BODY
        </Text>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          style={[
            styles.input,
            styles.multiline,
            {
              color: theme.text,
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        />
        <Text muted style={styles.hint}>
          This screen was pushed with {'`<Link fullScreen>`'} — it escaped the
          split and covers both columns. Tap “Wijzig” back to return to the
          split exactly where you left it.
        </Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  error: { marginTop: 56, color: '#D64545' },
  scroll: { flex: 1 },
  content: { padding: 20, maxWidth: 640, width: '100%', alignSelf: 'center' },
  label: { marginTop: 18, marginBottom: 6, letterSpacing: 0.6 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.control,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 140, textAlignVertical: 'top' },
  hint: { marginTop: 24, fontSize: 14, lineHeight: 21 },
});

export default React.memo(PostEditScreen);
