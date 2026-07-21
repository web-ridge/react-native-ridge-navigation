import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TripleSplitView } from 'react-native-ridge-navigation';

import routes from './Routes';
import ListItemLink from './ListItemLink';
import Text from './ui/Text';
import { useTheme } from './ui/theme';

const SECTIONS = [
  { key: 'general', label: 'General', description: 'Name, avatar, language' },
  { key: 'billing', label: 'Billing', description: 'Plan and invoices' },
  { key: 'team', label: 'Team', description: 'Members and roles' },
];

function Placeholder({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.placeholder}>
      <Text muted style={{ color: theme.muted }}>
        {text}
      </Text>
    </View>
  );
}

// Demo H — a three-column Settings workspace where BOTH the sidebar→middle
// (section) and middle→detail (item) selections are reflected in the MAIN URL
// as query params, so every level is deep-linkable and back-navigable, and a
// card pushed inside the detail column (a sub-form) becomes another URL entry.
function TripleWorkspaceScreen() {
  const theme = useTheme();
  return (
    <TripleSplitView
      breakingPointWidth={700}
      sidebarWidth={260}
      masterWidth={320}
      // Opt in to URL-reflected selections at both levels.
      sectionParam="section"
      detailParam="detail"
      sidebar={
        <ScrollView
          style={[styles.sidebar, { borderRightColor: theme.border }]}
        >
          <Text variant="title" style={styles.sidebarTitle}>
            Settings
          </Text>
          {SECTIONS.map((s) => (
            <ListItemLink
              key={s.key}
              testID={`section-${s.key}`}
              to={routes.TripleSectionScreen}
              params={{ key: s.key }}
              title={s.label}
              description={s.description}
            />
          ))}
        </ScrollView>
      }
      masterPlaceholder={<Placeholder text="Select a section" />}
      detailPlaceholder={<Placeholder text="Select an item" />}
    />
  );
}

const styles = StyleSheet.create({
  sidebar: { flex: 1, borderRightWidth: StyleSheet.hairlineWidth },
  sidebarTitle: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default React.memo(TripleWorkspaceScreen);
