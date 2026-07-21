import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation, useParams } from 'react-native-ridge-navigation';

import routes from './Routes';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

// Column 3 (detail). Its own cards push a SUB-FORM DEEPER into the same detail
// column. In `detailParam` mode that push becomes a new `?detail=` URL entry,
// so it is deep-linkable and its in-app back / browser Back steps back one
// level — the bug this release fixes (previously a dead click in the triple).
function TripleItemScreen() {
  const theme = useTheme();
  const { id } = useParams(routes.TripleItemScreen);
  const { push } = useNavigation();
  return (
    <ScrollView style={styles.root}>
      <Text variant="title" style={styles.title}>
        {id}
      </Text>
      <Pressable
        testID="detail-subform-card"
        onPress={() =>
          push(routes.TripleSubformScreen, { id }, { preload: true })
        }
        style={({ pressed }) => [
          styles.card,
          { borderColor: theme.border },
          pressed && { backgroundColor: theme.chip },
        ]}
      >
        <View>
          <Text variant="subtitle">Edit “{id}” ›</Text>
          <Text muted style={{ color: theme.muted }}>
            Open the sub-form in this pane
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: { padding: 16, textTransform: 'capitalize' },
  card: {
    marginHorizontal: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
});

export default React.memo(TripleItemScreen);
