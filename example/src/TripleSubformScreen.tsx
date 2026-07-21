import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BackLink, useParams } from 'react-native-ridge-navigation';

import routes from './Routes';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

// The sub-form drilled into from the detail column. Its in-app "Back" uses the
// library BackLink (pop), which in URL-selection mode steps the MAIN navigator
// back one level — deselecting the sub-form and returning to the item.
function TripleSubformScreen() {
  const theme = useTheme();
  const { id } = useParams(routes.TripleSubformScreen);
  return (
    <ScrollView style={styles.root}>
      <BackLink>
        {({ onPress }) => (
          <Pressable
            testID="subform-back"
            onPress={onPress}
            style={styles.back}
          >
            <Text style={{ color: theme.primary }}>‹ Back</Text>
          </Pressable>
        )}
      </BackLink>
      <View style={styles.body}>
        <Text variant="title">Editing {id}</Text>
        <Text muted style={{ color: theme.muted }}>
          This sub-form was pushed inside the detail column and is reflected in
          the URL.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  back: { paddingHorizontal: 16, paddingTop: 16 },
  body: { padding: 16, gap: 8 },
});

export default React.memo(TripleSubformScreen);
