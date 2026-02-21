import { create } from 'zustand';
import type { QueueItem } from '@/types/player';
import * as storage from '@/utils/storage';

interface FavoritesState {
  items: QueueItem[];
  toggle: (item: QueueItem) => void;
  isFavorite: (id: string) => boolean;
  hydrate: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  items: [],

  toggle: (item) => {
    set((state) => {
      const exists = state.items.some((i) => i.id === item.id);
      const next = exists
        ? state.items.filter((i) => i.id !== item.id)
        : [...state.items, item];
      storage.setStoredFavorites(next);
      return { items: next };
    });
  },

  isFavorite: (id) => get().items.some((i) => i.id === id),

  hydrate: async () => {
    const items = await storage.getStoredFavorites();
    set({ items });
  },
}));
