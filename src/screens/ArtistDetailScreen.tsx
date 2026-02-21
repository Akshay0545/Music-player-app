import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '@/navigation/types';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/api/client';
import { searchSongToQueueItem } from '@/api/adapters';
import { usePlayerStore } from '@/store/playerStore';
import { navigateToPlayer } from '@/navigation/rootNavigation';
import { SongRow } from '@/components/SongRow';
import type { QueueItem } from '@/types/player';

type Route = RouteProp<HomeStackParamList, 'ArtistDetail'>;

function pickImage(img: { quality: string; link?: string; url?: string }[] | undefined) {
  if (!img?.length) return '';
  const o = img.find((i) => i.quality === '500x500' || i.quality === '150x150') ?? img[0];
  return (o as { link?: string; url?: string }).link ?? (o as { url?: string }).url ?? '';
}

export function ArtistDetailScreen() {
  const { colors } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { artistId, artistName } = route.params;
  const [image, setImage] = useState('');
  const [songs, setSongs] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const addToQueue = usePlayerStore((s) => s.addToQueue);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [artistRes, songsRes] = await Promise.all([
          api.getArtist(artistId),
          api.getArtistSongs(artistId),
        ]);
        if (!cancelled && artistRes.data?.image) {
          setImage(pickImage(artistRes.data.image as { quality: string; link?: string; url?: string }[]));
        }
        const list = (songsRes.data as { results?: import('@/types/api').ApiSearchSongItem[] })?.results ?? [];
        if (!cancelled) setSongs(list.map(searchSongToQueueItem));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [artistId]);

  const totalMins = Math.floor(songs.reduce((a, s) => a + s.duration, 0) / 60);
  const summary = `1 Album | ${songs.length} Songs | ${Math.floor(totalMins / 60)}:${(totalMins % 60).toString().padStart(2, '0')} mins`;

  const playAll = () => {
    if (songs.length > 0) {
      addToQueue(songs[0], true);
      songs.slice(1).forEach((s) => addToQueue(s, false));
      navigateToPlayer();
    }
  };

  const shuffleAll = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    if (shuffled.length > 0) {
      addToQueue(shuffled[0], true);
      shuffled.slice(1).forEach((s) => addToQueue(s, false));
      navigateToPlayer();
    }
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backIcon, { color: colors.primaryText }]}>←</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.hero}>
        <Image source={{ uri: image || undefined }} style={styles.artwork} />
        <Text style={[styles.name, { color: colors.primaryText }]}>{artistName}</Text>
        <Text style={[styles.summary, { color: colors.secondaryText }]}>{summary}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.shuffleBtn, { backgroundColor: colors.accent }]} onPress={shuffleAll}>
            <Text style={styles.shuffleText}>🔀 Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.playBtn, { backgroundColor: colors.accentLight }]} onPress={playAll}>
            <Text style={[styles.playText, { color: colors.accent }]}>▶ Play</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.sectionHead, { borderBottomColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Songs</Text>
        <TouchableOpacity><Text style={[styles.seeAll, { color: colors.accent }]}>See All</Text></TouchableOpacity>
      </View>
      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SongRow
            item={item}
            onPress={() => { addToQueue(item, true); navigateToPlayer(); }}
            showPlayButton
            onOptionsPress={() => {}}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 8 },
  backIcon: { fontSize: 24 },
  hero: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 },
  artwork: { width: 180, height: 180, borderRadius: 16, backgroundColor: '#E5E5E5' },
  name: { fontSize: 24, fontWeight: '700', marginTop: 16 },
  summary: { fontSize: 13, marginTop: 6 },
  actions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  shuffleBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  shuffleText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  playBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 24 },
  playText: { fontWeight: '600', fontSize: 14 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  list: { paddingBottom: 120 },
});
