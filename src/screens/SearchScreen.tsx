import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { MumeHeader } from '@/components/MumeHeader';
import { SongRow } from '@/components/SongRow';
import { api } from '@/api/client';
import { searchSongToQueueItem } from '@/api/adapters';
import { usePlayerStore } from '@/store/playerStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { navigateToPlayer } from '@/navigation/rootNavigation';
import type { QueueItem } from '@/types/player';

export function SearchScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const topPadding = Math.max(insets.top, 24) + 20;

  const addToQueue = usePlayerStore((s) => s.addToQueue);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.searchSongs(query.trim(), 1, 30);
      const results = (res.data?.results ?? []).map((r: import('@/types/api').ApiSearchSongItem) =>
        searchSongToQueueItem(r)
      );
      setItems(results);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const playSong = useCallback((item: QueueItem) => {
    addToQueue(item, true);
    navigateToPlayer();
  }, [addToQueue]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={{ paddingTop: topPadding, backgroundColor: colors.background }}>
        <MumeHeader showSearch={false} />
      </View>
      <View style={styles.searchBlock}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.primaryText, borderColor: colors.border }]}
          placeholder="Search songs..."
          placeholderTextColor={colors.tertiaryText}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
          autoFocus
        />
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.accent }]} onPress={search}>
          <Text style={styles.btnText}>Search</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SongRow
              item={item}
              onPress={() => playSong(item)}
              showPlayButton
              onAddToQueue={() => addToQueue(item, false)}
              showAddButton
              showFavoriteButton
              isFavorite={isFavorite(item.id)}
              onFavoritePress={() => toggleFavorite(item)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBlock: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  btn: { marginTop: 14, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  loader: { marginTop: 32 },
  list: { padding: 16, paddingBottom: 100 },
});
