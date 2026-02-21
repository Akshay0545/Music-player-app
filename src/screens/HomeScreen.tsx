import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/types';
import { MumeHeader } from '@/components/MumeHeader';
import { CategoryTabs, type CategoryTab } from '@/components/CategoryTabs';
import { SectionHeader } from '@/components/SectionHeader';
import { SongRow } from '@/components/SongRow';
import { SongOptionsSheet } from '@/components/SongOptionsSheet';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/api/client';
import { searchSongToQueueItem } from '@/api/adapters';
import { usePlayerStore } from '@/store/playerStore';
import { navigateToPlayer } from '@/navigation/rootNavigation';
import type { QueueItem } from '@/types/player';
import type { ApiSearchArtistItem, ApiSearchAlbumItem } from '@/types/api';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const INITIAL_QUERY = 'hindi';
const PAGE_SIZE = 20;
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 12 * 2) / 3;

export function HomeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const topInset = Math.max(insets.top, 12) + 12;
  const [category, setCategory] = useState<CategoryTab>('Suggested');
  const [songs, setSongs] = useState<QueueItem[]>([]);
  const [artists, setArtists] = useState<ApiSearchArtistItem[]>([]);
  const [albums, setAlbums] = useState<ApiSearchAlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortLabel, setSortLabel] = useState('Ascending');
  const [sortOpen, setSortOpen] = useState(false);
  const [optionsItem, setOptionsItem] = useState<QueueItem | null>(null);

  const queue = usePlayerStore((s) => s.queue);
  const addToQueue = usePlayerStore((s) => s.addToQueue);

  const loadSongs = useCallback(async (append: boolean) => {
    setLoading(!append);
    setLoadingMore(append);
    try {
      const res = await api.searchSongs(INITIAL_QUERY, append ? page + 1 : 1, PAGE_SIZE);
      const data = res.data;
      const results = (data?.results ?? []).map((r: import('@/types/api').ApiSearchSongItem) =>
        searchSongToQueueItem(r)
      );
      setSongs((prev) => (append ? [...prev, ...results] : results));
      setTotal(data?.total ?? 0);
      if (!append) setPage(1);
      else setPage((p) => p + 1);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  const loadArtists = useCallback(async () => {
    try {
      const res = await api.searchArtists(INITIAL_QUERY, 1, 10);
      setArtists(res.data?.results ?? []);
    } catch {}
  }, []);

  const loadAlbums = useCallback(async () => {
    try {
      const res = await api.searchAlbums(INITIAL_QUERY, 1, 20);
      setAlbums(res.data?.results ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    loadSongs(false);
    loadArtists();
  }, []);
  useEffect(() => {
    if (category === 'Albums' && albums.length === 0) loadAlbums();
  }, [category]);

  const playSong = useCallback((item: QueueItem) => {
    addToQueue(item, true);
    navigateToPlayer();
  }, [addToQueue]);

  const recentSongs = queue.length > 0 ? queue.slice(0, 6) : songs.slice(0, 6);
  const suggestedSongs = songs.slice(0, 6);

  const pickImage = (img: { quality: string; link?: string; url?: string }[] | undefined) => {
    if (!img?.length) return '';
    const o = img.find((i) => i.quality === '500x500' || i.quality === '150x150') ?? img[0];
    return (o as { link?: string; url?: string }).link ?? (o as { url?: string }).url ?? '';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: topInset }]}>
      <MumeHeader onSearchPress={() => navigation.navigate('Search')} />
      <CategoryTabs active={category} onSelect={setCategory} />

      {category === 'Suggested' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SectionHeader title="Recently Played" onSeeAll={() => setCategory('Songs')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {recentSongs.length === 0 && suggestedSongs.length === 0 && loading ? (
              <ActivityIndicator size="small" color={colors.accent} style={{ marginLeft: 16 }} />
            ) : (
              (recentSongs.length ? recentSongs : suggestedSongs).map((item, index) => (
                <TouchableOpacity
                  key={`recently-${index}-${item.id}`}
                  style={styles.card}
                  onPress={() => playSong(item)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: item.image }} style={styles.cardArt} />
                  <Text style={[styles.cardTitle, { color: colors.primaryText }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.cardSub, { color: colors.secondaryText }]} numberOfLines={1}>
                    {item.primaryArtists}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <SectionHeader title="Artists" onSeeAll={() => setCategory('Artists')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {artists.length === 0 && category === 'Suggested' ? (
              <View style={styles.placeholderRow}>
                <Text style={[styles.placeholder, { color: colors.secondaryText }]}>Loading…</Text>
              </View>
            ) : (
              artists.slice(0, 6).map((a, index) => (
                <TouchableOpacity
                  key={`artist-${index}-${a.id}`}
                  style={styles.artistCard}
                  onPress={() => navigation.navigate('ArtistDetail', { artistId: a.id, artistName: a.name })}
                >
                  <Image source={{ uri: pickImage(a.image) }} style={styles.artistCircle} />
                  <Text style={[styles.artistName, { color: colors.primaryText }]} numberOfLines={1}>
                    {a.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
          <SectionHeader title="Most Played" onSeeAll={() => setCategory('Songs')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {suggestedSongs.slice(0, 6).map((item, index) => (
              <TouchableOpacity
                key={`mostplayed-${index}-${item.id}`}
                style={styles.card}
                onPress={() => playSong(item)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: item.image }} style={styles.cardArt} />
                <Text style={[styles.cardTitle, { color: colors.primaryText }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.cardSub, { color: colors.secondaryText }]} numberOfLines={1}>
                  {item.primaryArtists}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ScrollView>
      )}

      {category === 'Songs' && (
        <>
          <View style={[styles.songsHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.songCount, { color: colors.primaryText }]}>
              {total || songs.length} songs
            </Text>
            <TouchableOpacity
              style={styles.sortRow}
              onPress={() => setSortOpen((o) => !o)}
            >
              <Text style={[styles.sortLabel, { color: colors.accent }]}>{sortLabel}</Text>
              <Text style={[styles.sortIcon, { color: colors.accent }]}>⇅</Text>
            </TouchableOpacity>
          </View>
          {sortOpen && (
            <View style={[styles.sortDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {['Ascending', 'Descending', 'Artist', 'Album', 'Year', 'Date Added'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.sortOption}
                  onPress={() => {
                    setSortLabel(opt);
                    setSortOpen(false);
                  }}
                >
                  <Text style={[styles.sortOptionText, { color: colors.primaryText }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {loading && songs.length === 0 ? (
            <View style={styles.centered}><ActivityIndicator size="large" color={colors.accent} /></View>
          ) : (
            <FlatList
              data={songs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongRow
                  item={item}
                  onPress={() => playSong(item)}
                  onOptionsPress={() => setOptionsItem(item)}
                  showPlayButton
                />
              )}
              onEndReached={() => {
                if (!loadingMore && songs.length < total) loadSongs(true);
              }}
              onEndReachedThreshold={0.3}
              ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.accent} /> : null}
              contentContainerStyle={styles.songsList}
            />
          )}
        </>
      )}

      {category === 'Artists' && (
        <FlatList
          data={artists}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={
            loading ? <ActivityIndicator size="large" color={colors.accent} style={styles.loader} /> : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.albumCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('ArtistDetail', { artistId: item.id, artistName: item.name })}
            >
              <Image source={{ uri: pickImage(item.image) }} style={styles.albumArt} />
              <Text style={[styles.albumTitle, { color: colors.primaryText }]} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {category === 'Albums' && (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={
            loading ? <ActivityIndicator size="large" color={colors.accent} style={styles.loader} /> : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.albumCard, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate('AlbumDetail', { albumId: item.id, albumName: item.name })}
            >
              <Image source={{ uri: pickImage(item.image) }} style={styles.albumArt} />
              <Text style={[styles.albumTitle, { color: colors.primaryText }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.albumSub, { color: colors.secondaryText }]} numberOfLines={1}>
                {item.artists?.primary?.[0]?.name ?? 'Unknown'} | {item.year ?? ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      <SongOptionsSheet
        visible={!!optionsItem}
        onClose={() => setOptionsItem(null)}
        item={optionsItem}
        onPlayNext={(i) => { addToQueue(i, true); setOptionsItem(null); navigateToPlayer(); }}
        onAddToQueue={(i) => { addToQueue(i, false); setOptionsItem(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  carousel: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  card: { width: CARD_WIDTH, marginRight: 12 },
  cardArt: { width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 14, backgroundColor: '#E5E5E5' },
  cardTitle: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  cardSub: { fontSize: 12, marginTop: 2 },
  artistCard: { alignItems: 'center', marginRight: 20 },
  artistCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E5E5E5' },
  artistName: { fontSize: 13, marginTop: 8, maxWidth: 80 },
  placeholderRow: { paddingLeft: 16 },
  placeholder: { fontSize: 14 },
  songsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  songCount: { fontSize: 14 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortLabel: { fontSize: 14, fontWeight: '600' },
  sortIcon: { fontSize: 16 },
  sortDropdown: {
    position: 'absolute',
    top: 110,
    right: 16,
    zIndex: 10,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 4,
    minWidth: 160,
  },
  sortOption: { paddingVertical: 10, paddingHorizontal: 16 },
  sortOptionText: { fontSize: 14 },
  songsList: { paddingBottom: 120 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridContent: { padding: 16, paddingBottom: 120 },
  gridRow: { justifyContent: 'space-between', marginBottom: 20 },
  albumCard: { width: (width - 16 * 2 - 12) / 2, borderRadius: 14, overflow: 'hidden' },
  albumArt: { width: '100%', aspectRatio: 1, borderRadius: 14, backgroundColor: '#E5E5E5' },
  albumTitle: { fontSize: 14, fontWeight: '600', marginTop: 10, paddingHorizontal: 10 },
  albumSub: { fontSize: 12, marginTop: 2, paddingHorizontal: 10, marginBottom: 14 },
  loader: { marginTop: 40 },
});
