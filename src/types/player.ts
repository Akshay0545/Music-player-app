/** Normalized app-level types (single shape for images and URLs) */

export interface SongImage {
  quality: string;
  url: string;
}

export interface SongAlbum {
  id: string | null;
  name: string | null;
}

export interface SongArtist {
  id: string;
  name: string;
}

export interface QueueItem {
  id: string;
  name: string;
  duration: number; // seconds
  album: SongAlbum;
  primaryArtists: string;
  image: string; // single URL, prefer 500x500 or 150x150
  streamUrl: string; // 320kbps or 160kbps or 96kbps
  localUri?: string; // for offline
}

export type RepeatMode = 'off' | 'one' | 'all';
