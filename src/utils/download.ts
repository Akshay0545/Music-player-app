import * as FileSystem from 'expo-file-system';
import { usePlayerStore } from '@/store/playerStore';

export async function downloadSong(id: string, streamUrl: string): Promise<string> {
  const dir = FileSystem.documentDirectory + 'music/';
  const exists = await FileSystem.getInfoAsync(dir);
  if (!exists.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  const path = dir + id + '.mp4';
  await FileSystem.downloadAsync(streamUrl, path);
  usePlayerStore.getState().setItemLocalUri(id, path);
  return path;
}

export function getDownloadedPath(id: string): string | undefined {
  const queue = usePlayerStore.getState().queue;
  return queue.find((item) => item.id === id)?.localUri;
}
