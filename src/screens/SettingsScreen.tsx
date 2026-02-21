import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MumeHeader } from '@/components/MumeHeader';

export function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();

  const cycleMode = () => {
    if (mode === 'light') setMode('dark');
    else if (mode === 'dark') setMode('system');
    else setMode('light');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MumeHeader showSearch={false} />
      <View style={[styles.section, { borderBottomColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>Appearance</Text>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: colors.card }]}
          onPress={cycleMode}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowText, { color: colors.primaryText }]}>Theme</Text>
          <Text style={[styles.value, { color: colors.accent }]}>
            {mode === 'system' ? 'System' : mode === 'light' ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 24, borderBottomWidth: StyleSheet.hairlineWidth, paddingBottom: 12 },
  label: { fontSize: 13, marginBottom: 8, textTransform: 'uppercase' },
  row: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  rowText: { fontSize: 16, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '600', position: 'absolute', right: 16, top: 14 },
});
