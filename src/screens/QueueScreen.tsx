import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { usePlayerStore } from '@/store/playerStore';
import { useTheme } from '@/context/ThemeContext';
import { navigateToPlayer } from '@/navigation/rootNavigation';
import { MumeHeader } from '@/components/MumeHeader';

export function QueueScreen() {
  const { colors } = useTheme();
  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const reorderQueue = usePlayerStore((s) => s.reorderQueue);
  const goToIndex = usePlayerStore((s) => s.goToIndex);

  const onRemove = (index: number) => {
    Alert.alert('Remove', 'Remove this song from queue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromQueue(index) },
    ]);
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    reorderQueue(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index >= queue.length - 1) return;
    reorderQueue(index, index + 1);
  };

  const downloadedCount = queue.filter((s) => s.localUri).length;

  if (queue.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.empty, { color: colors.primaryText }]}>Queue is empty</Text>
        <Text style={[styles.hint, { color: colors.secondaryText }]}>Add songs from Home</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MumeHeader showSearch={false} />
      {downloadedCount > 0 && (
        <Text style={[styles.downloadedBadge, { color: colors.accent }]}>Downloaded: {downloadedCount} song(s)</Text>
      )}
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => {
          const isCurrent = index === currentIndex;
          const durationStr = `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`;
          return (
            <View style={[styles.row, { borderBottomColor: colors.border }, isCurrent && { borderLeftWidth: 3, borderLeftColor: colors.accent }]}>
              <TouchableOpacity
                style={styles.rowMain}
                onPress={() => {
                  goToIndex(index);
                  navigateToPlayer();
                }}
              >
                <Text style={[styles.index, { color: colors.secondaryText }]}>{index + 1}</Text>
                <View style={styles.info}>
                  <Text style={[styles.title, { color: colors.primaryText }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.secondaryText }]} numberOfLines={1}>
                    {item.primaryArtists}
                  </Text>
                </View>
                <Text style={[styles.duration, { color: colors.secondaryText }]}>{durationStr}</Text>
              </TouchableOpacity>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.moveBtn, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <Text style={[styles.moveBtnText, { color: colors.primaryText }]}>↑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.moveBtn, { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => moveDown(index)}
                  disabled={index === queue.length - 1}
                >
                  <Text style={[styles.moveBtnText, { color: colors.primaryText }]}>↓</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.removeBtn, { backgroundColor: colors.accentLight }]} onPress={() => onRemove(index)}>
                  <Text style={[styles.removeBtnText, { color: colors.accent }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#fff', fontSize: 18 },
  hint: { color: '#888', marginTop: 8 },
  downloadedBadge: {
    color: '#6c6',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listContent: { paddingBottom: 100, paddingHorizontal: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  index: { width: 28, fontSize: 14 },
  info: { flex: 1, marginLeft: 8 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13 },
  duration: { fontSize: 12, marginLeft: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  moveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveBtnText: { fontSize: 16 },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { fontSize: 16 },
});
