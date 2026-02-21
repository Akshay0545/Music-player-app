import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePlayerStore } from '@/store/playerStore';
import { usePlayerActions } from '@/context/PlayerContext';
import { useTheme } from '@/context/ThemeContext';
import { SeekBar } from '@/components/SeekBar';
import { downloadSong } from '@/utils/download';
import type { RepeatMode } from '@/types/player';

export function PlayerScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const repeatMode = usePlayerStore((s) => s.repeatMode);
  const setShuffle = usePlayerStore((s) => s.setShuffle);
  const setRepeatMode = usePlayerStore((s) => s.setRepeatMode);

  const { play, pause, seekTo, next, prev } = usePlayerActions();
  const [downloading, setDownloading] = useState(false);

  const track = queue[currentIndex];
  const isDownloaded = !!track?.localUri;

  const cycleRepeat = (): RepeatMode => {
    if (repeatMode === 'off') return 'all';
    if (repeatMode === 'all') return 'one';
    return 'off';
  };

  const seekBack = () => seekTo(Math.max(0, position - 10));
  const seekForward = () => seekTo(Math.min(duration, position + 10));

  if (!track) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.empty, { color: colors.secondaryText }]}>No track selected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={[styles.headerIcon, { color: colors.primaryText }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerBtn}>
          <Text style={[styles.headerIcon, { color: colors.primaryText }]}>⋯</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.artworkWrap}>
        <Image source={{ uri: track.image || undefined }} style={styles.artwork} />
      </View>
      <Text style={[styles.title, { color: colors.primaryText }]}>{track.name}</Text>
      <Text style={[styles.subtitle, { color: colors.secondaryText }]}>{track.primaryArtists}</Text>

      <SeekBar position={position} duration={duration} onSeek={seekTo} />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={prev}>
          <Text style={[styles.controlIcon, { color: colors.primaryText }]}>⏮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={seekBack}>
          <Text style={[styles.controlIcon, { color: colors.primaryText }]}>10 ⟲</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.accent }]}
          onPress={() => (isPlaying ? pause() : play())}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={seekForward}>
          <Text style={[styles.controlIcon, { color: colors.primaryText }]}>10 ⟳</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={next}>
          <Text style={[styles.controlIcon, { color: colors.primaryText }]}>⏭</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.secondaryRow}>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => setShuffle(!shuffle)}
        >
          <Text style={[styles.smallIcon, { color: shuffle ? colors.accent : colors.secondaryText }]}>🔀</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn}>
          <Text style={[styles.smallIcon, { color: colors.secondaryText }]}>🕐</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn}>
          <Text style={[styles.smallIcon, { color: colors.secondaryText }]}>📺</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.smallBtn}
          onPress={() => setRepeatMode(cycleRepeat())}
        >
          <Text style={[styles.smallIcon, { color: repeatMode !== 'off' ? colors.accent : colors.secondaryText }]}>🔁</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.lyricsRow}>
        <Text style={[styles.lyricsLabel, { color: colors.secondaryText }]}>⌃</Text>
        <Text style={[styles.lyricsText, { color: colors.secondaryText }]}>Lyrics</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.downloadBtn, { backgroundColor: colors.accentLight }]}
        onPress={async () => {
          if (!track?.streamUrl || isDownloaded) return;
          setDownloading(true);
          try {
            await downloadSong(track.id, track.streamUrl);
          } catch (e) {
            Alert.alert('Download failed', e instanceof Error ? e.message : 'Unknown error');
          } finally {
            setDownloading(false);
          }
        }}
        disabled={!track?.streamUrl || isDownloaded || downloading}
      >
        <Text style={[styles.downloadBtnText, { color: colors.accent }]}>
          {isDownloaded ? 'Downloaded' : downloading ? 'Downloading...' : 'Download for offline'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: { padding: 8 },
  headerIcon: { fontSize: 24 },
  artworkWrap: { alignItems: 'center', marginTop: 24 },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 16, textAlign: 'center', marginTop: 4 },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 28,
  },
  controlBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: { fontSize: 14 },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 28 },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 16,
  },
  smallBtn: { padding: 8 },
  smallIcon: { fontSize: 22 },
  lyricsRow: { alignItems: 'center', marginTop: 24 },
  lyricsLabel: { fontSize: 20 },
  lyricsText: { fontSize: 14, marginTop: 4 },
  downloadBtn: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  downloadBtnText: { fontWeight: '600' },
});
