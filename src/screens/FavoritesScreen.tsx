import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { MumeHeader } from '@/components/MumeHeader';
import { SongRow } from '@/components/SongRow';
import { useFavoritesStore } from '@/store/favoritesStore';
import { usePlayerStore } from '@/store/playerStore';
import { navigateToPlayer } from '@/navigation/rootNavigation';
import type { QueueItem } from '@/types/player';

export function FavoritesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 12) + 12;
  const items = useFavoritesStore((s) => s.items);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const playSong = (item: QueueItem) => {
    addToQueue(item, true);
    navigateToPlayer();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <MumeHeader showSearch={false} />
      {items.length === 0 ? (
        <View style={styles.centered}>
          <Text style={[styles.title, { color: colors.primaryText }]}>Favorites</Text>
          <Text style={[styles.hint, { color: colors.secondaryText }]}>
            Your liked songs will appear here. Tap ♡ on any song to add it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <SongRow
              item={item}
              onPress={() => playSong(item)}
              showPlayButton
              showFavoriteButton
              isFavorite={isFavorite(item.id)}
              onFavoritePress={() => toggleFavorite(item)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  title: { fontSize: 20, fontWeight: '700' },
  hint: { marginTop: 8, fontSize: 14, textAlign: 'center' },
  list: { paddingBottom: 120 },
});
