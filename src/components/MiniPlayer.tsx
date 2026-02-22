import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { usePlayerStore } from '@/store/playerStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { usePlayerActions } from '@/context/PlayerContext';
import { navigateToPlayer } from '@/navigation/rootNavigation';

export function MiniPlayer() {
  const { colors } = useTheme();
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const { play, pause } = usePlayerActions();
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);

  const track = queue[currentIndex];
  if (!track) return null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}
      onPress={navigateToPlayer}
      activeOpacity={0.9}
    >
      <Image source={{ uri: track.image || undefined }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]} numberOfLines={1}>
          {track.primaryArtists}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.control, { backgroundColor: colors.accent }]}
        onPress={(e) => {
          e.stopPropagation();
          isPlaying ? pause() : play();
        }}
      >
        <Text style={styles.controlText}>{isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.heartBtn}
        onPress={(e) => {
          e.stopPropagation();
          toggleFavorite(track);
        }}
      >
        <Text style={[styles.heartIcon, { color: isFavorite(track.id) ? '#E53935' : colors.secondaryText }]}>
          {isFavorite(track.id) ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 42,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  info: { flex: 1, marginLeft: 14 },
  title: { fontSize: 14, fontWeight: '600' },
  subtitle: { fontSize: 12 },
  control: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  controlText: { color: '#fff', fontSize: 18 },
  heartBtn: {
    minWidth: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  heartIcon: { fontSize: 20, includeFontPadding: false },
});
