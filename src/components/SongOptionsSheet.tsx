import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import type { QueueItem } from '@/types/player';

interface SongOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  item: QueueItem | null;
  onPlayNext?: (item: QueueItem) => void;
  onAddToQueue?: (item: QueueItem) => void;
  onAddToPlaylist?: (item: QueueItem) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (item: QueueItem) => void;
}

const OPTIONS = [
  { id: 'playNext', label: 'Play Next', icon: '⏭' },
  { id: 'addToQueue', label: 'Add to Playing Queue', icon: '➕' },
  { id: 'addToPlaylist', label: 'Add to Playlist', icon: '📋' },
  { id: 'goToAlbum', label: 'Go to Album', icon: '💿' },
  { id: 'goToArtist', label: 'Go to Artist', icon: '👤' },
  { id: 'details', label: 'Details', icon: 'ℹ️' },
  { id: 'share', label: 'Share', icon: '✈️' },
] as const;

export function SongOptionsSheet({
  visible,
  onClose,
  item,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  isFavorite,
  onToggleFavorite,
}: SongOptionsSheetProps) {
  const { colors } = useTheme();
  const durationStr = item
    ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')} mins`
    : '';

  const handleOption = (id: string) => {
    if (!item) return;
    if (id === 'playNext' && onPlayNext) onPlayNext(item);
    if (id === 'addToQueue' && onAddToQueue) onAddToQueue(item);
    if (id === 'addToPlaylist' && onAddToPlaylist) onAddToPlaylist(item);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.background }]} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.handle, { backgroundColor: colors.modalHandle }]} />
          {item && (
            <>
              <View style={[styles.songRow, { borderBottomColor: colors.border }]}>
                <Image source={{ uri: item.image }} style={styles.songThumb} />
                <View style={styles.songInfo}>
                  <Text style={[styles.songTitle, { color: colors.primaryText }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.songMeta, { color: colors.secondaryText }]} numberOfLines={1}>
                    {item.primaryArtists} | {durationStr}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => { if (item && onToggleFavorite) onToggleFavorite(item); onClose(); }}
                  style={styles.heartBtn}
                >
                  <Text style={[styles.heart, { color: isFavorite ? '#E53935' : colors.secondaryText }]}>
                    {isFavorite ? '♥' : '♡'}
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
                {onToggleFavorite && (
                  <TouchableOpacity
                    style={[styles.optionRow, { borderBottomColor: colors.border }]}
                    onPress={() => { if (item) onToggleFavorite(item); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionIcon, { color: isFavorite ? '#E53935' : colors.primaryText }]}>
                      {isFavorite ? '♥' : '♡'}
                    </Text>
                    <Text style={[styles.optionLabel, { color: colors.primaryText }]}>
                      {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </Text>
                  </TouchableOpacity>
                )}
                {OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[styles.optionRow, { borderBottomColor: colors.border }]}
                    onPress={() => handleOption(opt.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionIcon, { color: colors.primaryText }]}>{opt.icon}</Text>
                    <Text style={[styles.optionLabel, { color: colors.primaryText }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  songThumb: { width: 48, height: 48, borderRadius: 8, backgroundColor: '#E5E5E5' } as const,
  songInfo: { flex: 1, marginLeft: 12 },
  songTitle: { fontSize: 16, fontWeight: '600' },
  songMeta: { fontSize: 13, marginTop: 2 },
  heartBtn: {
    minWidth: 40,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  heart: { fontSize: 20, includeFontPadding: false },
  optionsList: { paddingHorizontal: 16 },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionIcon: { fontSize: 18, marginRight: 12 },
  optionLabel: { fontSize: 16 },
});
