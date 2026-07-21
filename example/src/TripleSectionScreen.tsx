import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useParams } from 'react-native-ridge-navigation';

import routes from './Routes';
import ListItemLink from './ListItemLink';
import Text from './ui/Text';

// Middle column: a list of items for the chosen section. Each row selects the
// detail column (column 3) — routed through the main URL via `detailParam`.
const ITEMS: Record<string, { id: string; title: string; body: string }[]> = {
  general: [
    { id: 'name', title: 'Name & email', body: 'Your public identity' },
    { id: 'appearance', title: 'Appearance', body: 'Theme and density' },
    { id: 'language', title: 'Language', body: 'App language' },
  ],
  billing: [
    { id: 'plan', title: 'Plan', body: 'Your subscription' },
    { id: 'invoices', title: 'Invoices', body: 'Past payments' },
  ],
  team: [
    { id: 'members', title: 'Members', body: 'People in your team' },
    { id: 'roles', title: 'Roles', body: 'Permissions' },
  ],
};

function TripleSectionScreen() {
  const { key } = useParams(routes.TripleSectionScreen);
  const items = ITEMS[key] ?? [];
  return (
    <ScrollView style={styles.root}>
      <Text variant="title" style={styles.title}>
        {key}
      </Text>
      <View>
        {items.map((it) => (
          <ListItemLink
            key={it.id}
            testID={`item-${it.id}`}
            to={routes.TripleItemScreen}
            params={{ id: it.id }}
            title={it.title}
            description={it.body}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  title: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'capitalize',
  },
});

export default React.memo(TripleSectionScreen);
