import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QueueItem } from '@/types/player';

const QUEUE_KEY = '@music_player_queue';
const QUEUE_INDEX_KEY = '@music_player_queue_index';

export async function getStoredQueue(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setStoredQueue(items: QueueItem[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

export async function getStoredQueueIndex(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_INDEX_KEY);
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  } catch {
    return 0;
  }
}

export async function setStoredQueueIndex(index: number): Promise<void> {
  await AsyncStorage.setItem(QUEUE_INDEX_KEY, String(index));
}

const DOWNLOADS_KEY = '@music_player_downloads';

export async function getDownloadedIds(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export async function setDownloadedIds(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(map));
}

const FAVORITES_KEY = '@music_player_favorites';

export async function getStoredFavorites(): Promise<QueueItem[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function setStoredFavorites(items: QueueItem[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
}
