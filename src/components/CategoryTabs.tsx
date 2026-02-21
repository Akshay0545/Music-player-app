import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

const TABS = ['Suggested', 'Songs', 'Artists', 'Albums'] as const;
export type CategoryTab = (typeof TABS)[number];

interface CategoryTabsProps {
  active: CategoryTab;
  onSelect: (tab: CategoryTab) => void;
}

export function CategoryTabs({ active, onSelect }: CategoryTabsProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrap, { borderBottomColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {TABS.map((tab) => {
          const isActive = active === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onSelect(tab)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.accent : colors.secondaryText },
                ]}
              >
                {tab}
              </Text>
              {isActive && (
                <View style={[styles.underline, { backgroundColor: colors.accent }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: StyleSheet.hairlineWidth },
  scroll: { paddingHorizontal: 18, paddingVertical: 14, gap: 24 },
  tab: { marginRight: 4 },
  tabText: { fontSize: 16, fontWeight: '600' },
  underline: { height: 3, borderRadius: 2, marginTop: 8, width: '100%' },
});
