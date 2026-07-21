import * as React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { TripleSplitView } from 'react-native-ridge-navigation';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from './ui/Text';

const SIDEBAR_WIDTH = 300;

const CATEGORIES = [
  { key: 'summary', label: 'Summary', icon: 'sparkles-outline' as const },
  { key: 'heart', label: 'Heart', icon: 'heart-outline' as const },
  { key: 'activity', label: 'Activity', icon: 'flame-outline' as const },
  { key: 'sleep', label: 'Sleep', icon: 'moon-outline' as const },
  { key: 'nutrition', label: 'Nutrition', icon: 'nutrition-outline' as const },
];

// Demo F — Health-style: a TRANSLUCENT glass sidebar floating ON TOP of an
// edge-to-edge colored/gradient content area, so the color bleeds under it.
function HealthScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = React.useState('summary');

  const gradient = 'linear-gradient(160deg, #FF5E7E 0%, #FF2D55 45%, #D11450 100%)';

  return (
    <TripleSplitView
      breakingPointWidth={700}
      floatingSidebar
      sidebarWidth={SIDEBAR_WIDTH}
      masterWidth={560}
      // Glass sidebar surface. On native the real blur comes from the BlurView
      // rendered inside; the wrapper only needs a hairline separator.
      sidebarStyle={styles.sidebarWrap}
      sidebar={
        <View style={styles.sidebarFill}>
          {Platform.OS !== 'web' ? (
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={60}
              tint="systemChromeMaterialLight"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.webGlass]} />
          )}
          <View style={{ paddingTop: insets.top + 14 }}>
            <Text style={styles.sidebarTitle}>Health</Text>
            {CATEGORIES.map((c) => {
              const active = c.key === selected;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setSelected(c.key)}
                  style={[styles.sidebarRow, active && styles.sidebarRowActive]}
                >
                  <Ionicons
                    name={c.icon}
                    size={20}
                    color={active ? '#FF2D55' : '#3A3A3C'}
                  />
                  <Text
                    style={[
                      styles.sidebarLabel,
                      active && { color: '#FF2D55', fontWeight: '700' },
                    ]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }
      // Middle column carries the immersive gradient. It starts at x=0, so its
      // left band bleeds UNDER the glass sidebar; readable content is inset past
      // the sidebar width.
      masterPlaceholder={
        <View
          style={[
            styles.immersive,
            // @ts-ignore RN 0.76+ CSS gradient
            { experimental_backgroundImage: gradient },
          ]}
        >
          <ScrollView
            contentContainerStyle={{
              paddingTop: insets.top + 16,
              paddingLeft: SIDEBAR_WIDTH + 24,
              paddingRight: 24,
              paddingBottom: 40,
            }}
          >
            <Text color="rgba(255,255,255,0.85)" style={styles.kicker}>
              TUESDAY, 21 JULY
            </Text>
            <Text color="#FFFFFF" style={styles.summaryTitle}>
              Summary
            </Text>
            <View style={styles.ring}>
              <Text color="#FFFFFF" style={styles.ringBig}>
                8,240
              </Text>
              <Text color="rgba(255,255,255,0.85)" style={styles.ringSub}>
                steps
              </Text>
            </View>
            {['Heart 72 bpm', 'Move 480 kcal', 'Sleep 7h 20m'].map((m) => (
              <View key={m} style={styles.summaryCard}>
                <Text color="#FFFFFF" style={styles.summaryCardText}>
                  {m}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      }
      detailPlaceholder={
        <View style={styles.detail}>
          <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={styles.detailTitle}>Trends</Text>
            <Text muted style={styles.detailBody}>
              Detail column. The sidebar on the left is a translucent glass panel
              floating over the pink summary — the color visibly bleeds under it,
              like Health on iOS 26.
            </Text>
          </ScrollView>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  sidebarWrap: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
  },
  sidebarFill: { flex: 1 },
  webGlass: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    // @ts-ignore web-only
    backdropFilter: 'saturate(180%) blur(24px)',
    WebkitBackdropFilter: 'saturate(180%) blur(24px)',
  },
  sidebarTitle: {
    fontSize: 26,
    fontWeight: '800',
    paddingHorizontal: 18,
    marginBottom: 8,
    color: '#1C1C1E',
  },
  sidebarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
  },
  sidebarRowActive: { backgroundColor: 'rgba(255,255,255,0.6)' },
  sidebarLabel: { fontSize: 16, color: '#1C1C1E' },
  immersive: { flex: 1, overflow: 'hidden' },
  kicker: { fontSize: 13, fontWeight: '700', letterSpacing: 0.8 },
  summaryTitle: { fontSize: 34, fontWeight: '800', marginTop: 2 },
  ring: {
    marginTop: 20,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBig: { fontSize: 30, fontWeight: '800' },
  ringSub: { fontSize: 14 },
  summaryCard: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 16,
    padding: 18,
  },
  summaryCardText: { fontSize: 17, fontWeight: '600' },
  detail: { flex: 1 },
  detailTitle: { fontSize: 24, fontWeight: '800' },
  detailBody: { marginTop: 10, fontSize: 15, lineHeight: 22 },
});

export default React.memo(HealthScreen);
