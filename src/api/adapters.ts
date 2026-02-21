import type { ApiSearchSongItem, ApiSongItem } from '@/types/api';
import type { QueueItem } from '@/types/player';

function pickImageUrl(items: { quality: string; link?: string; url?: string }[] | undefined): string {
  if (!items?.length) return '';
  const order = ['500x500', '150x150', '50x50'];
  for (const q of order) {
    const found = items.find((i) => i.quality === q);
    if (found) return (found as { link?: string; url?: string }).link ?? (found as { url?: string }).url ?? '';
  }
  const first = items[0] as { link?: string; url?: string };
  return first.link ?? first.url ?? '';
}

function pickStreamUrl(items: { quality: string; link?: string; url?: string }[] | undefined): string {
  if (!items?.length) return '';
  const order = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  for (const q of order) {
    const found = items.find((i) => i.quality === q);
    if (found) return (found as { link?: string; url?: string }).link ?? (found as { url?: string }).url ?? '';
  }
  const first = items[0] as { link?: string; url?: string };
  return first.link ?? first.url ?? '';
}

export function searchSongToQueueItem(item: ApiSearchSongItem): QueueItem {
  const duration = parseInt(item.duration ?? '0', 10) || 0;
  return {
    id: item.id,
    name: item.name,
    duration,
    album: {
      id: item.album?.id ?? null,
      name: item.album?.name ?? null,
    },
    primaryArtists: item.primaryArtists ?? '',
    image: pickImageUrl(item.image),
    streamUrl: pickStreamUrl(item.downloadUrl),
  };
}

export function songItemToQueueItem(item: ApiSongItem): QueueItem {
  return {
    id: item.id,
    name: item.name,
    duration: item.duration ?? 0,
    album: {
      id: item.album?.id ?? null,
      name: item.album?.name ?? null,
    },
    primaryArtists: item.artists?.primary?.map((a) => a.name).join(', ') ?? '',
    image: pickImageUrl(item.image as { quality: string; link?: string; url?: string }[]),
    streamUrl: pickStreamUrl(item.downloadUrl as { quality: string; link?: string; url?: string }[]),
  };
}
