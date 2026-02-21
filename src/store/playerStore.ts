import { create } from 'zustand';
import type { QueueItem } from '@/types/player';
import type { RepeatMode } from '@/types/player';
import * as storage from '@/utils/storage';

interface PlayerState {
  queue: QueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeatMode: RepeatMode;

  setQueue: (items: QueueItem[]) => void;
  addToQueue: (item: QueueItem, playNow?: boolean) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  goToIndex: (index: number) => void;
  setPlaying: (playing: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setShuffle: (shuffle: boolean) => void;
  setRepeatMode: (mode: RepeatMode) => void;

  getNextIndex: () => number;
  getPrevIndex: () => number;
  persistQueue: () => Promise<void>;
  hydrate: () => Promise<void>;
  setItemLocalUri: (id: string, localUri: string) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeatMode: 'off',

  setQueue: (items) => set({ queue: items, currentIndex: 0 }),

  addToQueue: (item, playNow) => {
    const { queue, currentIndex } = get();
    const exists = queue.findIndex((s) => s.id === item.id);
    let nextQueue = exists >= 0 ? queue : [...queue, item];
    let nextIndex = currentIndex;
    if (playNow) {
      const idx = nextQueue.findIndex((s) => s.id === item.id);
      nextIndex = idx >= 0 ? idx : nextQueue.length - 1;
    }
    set({ queue: nextQueue, currentIndex: nextIndex });
    get().persistQueue();
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    if (index < 0 || index >= queue.length) return;
    const nextQueue = queue.filter((_, i) => i !== index);
    let nextIndex = currentIndex;
    if (index < currentIndex) nextIndex = currentIndex - 1;
    else if (index === currentIndex && nextQueue.length > 0) nextIndex = Math.min(currentIndex, nextQueue.length - 1);
    else if (nextQueue.length === 0) nextIndex = 0;
    set({ queue: nextQueue, currentIndex: Math.min(nextIndex, Math.max(0, nextQueue.length - 1)) });
    get().persistQueue();
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue } = get();
    if (fromIndex < 0 || fromIndex >= queue.length || toIndex < 0 || toIndex >= queue.length) return;
    const next = [...queue];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    let nextIndex = get().currentIndex;
    if (nextIndex === fromIndex) nextIndex = toIndex;
    else if (fromIndex < nextIndex && toIndex >= nextIndex) nextIndex--;
    else if (fromIndex > nextIndex && toIndex <= nextIndex) nextIndex++;
    set({ queue: next, currentIndex: nextIndex });
    get().persistQueue();
  },

  goToIndex: (index) => {
    const { queue } = get();
    if (queue.length === 0) return;
    const nextIndex = Math.max(0, Math.min(index, queue.length - 1));
    set({ currentIndex: nextIndex, position: 0 });
    get().persistQueue();
  },

  setPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setShuffle: (shuffle) => set({ shuffle }),
  setRepeatMode: (mode) => set({ repeatMode: mode }),

  getNextIndex: () => {
    const { queue, currentIndex, shuffle, repeatMode } = get();
    if (queue.length === 0) return 0;
    if (repeatMode === 'one') return currentIndex;
    if (shuffle) return Math.floor(Math.random() * queue.length);
    if (currentIndex >= queue.length - 1) return repeatMode === 'all' ? 0 : currentIndex;
    return currentIndex + 1;
  },

  getPrevIndex: () => {
    const { queue, currentIndex, position, repeatMode } = get();
    if (queue.length === 0) return 0;
    if (position > 3) return currentIndex; // restart same track
    if (currentIndex <= 0) return repeatMode === 'all' ? queue.length - 1 : 0;
    return currentIndex - 1;
  },

  persistQueue: async () => {
    const { queue, currentIndex } = get();
    await storage.setStoredQueue(queue);
    await storage.setStoredQueueIndex(currentIndex);
  },

  setItemLocalUri: (id, localUri) => {
    const { queue } = get();
    const next = queue.map((item) => (item.id === id ? { ...item, localUri } : item));
    set({ queue: next });
    get().persistQueue();
    storage.getDownloadedIds().then((m) => {
      storage.setDownloadedIds({ ...m, [id]: localUri });
    });
  },

  hydrate: async () => {
    const [queue, index, downloads] = await Promise.all([
      storage.getStoredQueue(),
      storage.getStoredQueueIndex(),
      storage.getDownloadedIds(),
    ]);
    const mergedQueue =
      queue.length > 0
        ? queue.map((item) => ({
            ...item,
            localUri: item.localUri ?? downloads[item.id],
          }))
        : [];
    set({
      queue: mergedQueue,
      currentIndex:
        mergedQueue.length > 0 ? Math.min(index, mergedQueue.length - 1) : 0,
    });
  },
}));
