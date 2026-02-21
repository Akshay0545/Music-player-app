import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { MumeHeader } from '@/components/MumeHeader';

export function FavoritesScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MumeHeader showSearch={false} />
      <View style={styles.centered}>
        <Text style={[styles.title, { color: colors.primaryText }]}>Favorites</Text>
        <Text style={[styles.hint, { color: colors.secondaryText }]}>Your liked songs will appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  hint: { marginTop: 8, fontSize: 14 },
});
