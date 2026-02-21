import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface MumeHeaderProps {
  onSearchPress?: () => void;
  showSearch?: boolean;
}

export function MumeHeader({ onSearchPress, showSearch = true }: MumeHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.left}>
        <Text style={[styles.logoIcon, { color: colors.accent }]}>♪</Text>
        <Text style={[styles.logoText, { color: colors.primaryText }]}>Mume</Text>
      </View>
      {showSearch && (
        <TouchableOpacity onPress={onSearchPress} style={styles.searchBtn} hitSlop={12}>
          <Text style={[styles.searchIcon, { color: colors.primaryText }]}>🔍</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { fontSize: 28, fontWeight: '700' },
  logoText: { fontSize: 22, fontWeight: '700' },
  searchBtn: { padding: 4 },
  searchIcon: { fontSize: 22 },
});
