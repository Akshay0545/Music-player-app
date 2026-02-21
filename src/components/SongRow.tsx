import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { QueueItem } from '@/types/player';

interface SongRowProps {
  item: QueueItem;
  onPress: () => void;
  onOptionsPress?: () => void;
  showPlayButton?: boolean;
  showAddButton?: boolean;
  onAddToQueue?: () => void;
}

export function SongRow({
  item,
  onPress,
  onOptionsPress,
  showPlayButton = true,
  showAddButton,
  onAddToQueue,
}: SongRowProps) {
  const { colors } = useTheme();
  const durationMin = Math.floor(item.duration / 60);
  const durationSec = item.duration % 60;
  const durationStr = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec} mins`;

  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.image || undefined }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.subtitle, { color: colors.secondaryText }]} numberOfLines={1}>
          {item.primaryArtists || item.album?.name || 'Unknown'}
        </Text>
      </View>
      <Text style={[styles.duration, { color: colors.secondaryText }]}>{durationStr}</Text>
      {showPlayButton && (
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.accent }]}
          onPress={(e) => {
            e.stopPropagation();
            onPress();
          }}
        >
          <Text style={styles.playIcon}>▶</Text>
        </TouchableOpacity>
      )}
      {showAddButton && onAddToQueue && (
        <TouchableOpacity style={styles.addBtn} onPress={(e) => { e.stopPropagation(); onAddToQueue(); }}>
          <Text style={[styles.addBtnText, { color: colors.accent }]}>+ Queue</Text>
        </TouchableOpacity>
      )}
      {onOptionsPress && (
        <TouchableOpacity
          style={styles.optionsBtn}
          onPress={(e) => {
            e.stopPropagation();
            onOptionsPress();
          }}
        >
          <Text style={[styles.optionsIcon, { color: colors.secondaryText }]}>⋯</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  artwork: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  info: { flex: 1, marginLeft: 14 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, marginTop: 2 },
  duration: { fontSize: 12, marginRight: 10 },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  playIcon: { color: '#fff', fontSize: 14 },
  addBtn: { paddingVertical: 6, paddingHorizontal: 10 },
  addBtnText: { fontSize: 12, fontWeight: '600' },
  optionsBtn: { padding: 8 },
  optionsIcon: { fontSize: 18, fontWeight: '700' },
});
