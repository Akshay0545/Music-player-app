/** API response types for JioSaavn API (saavn.sumit.co) */

export interface ApiImage {
  quality: string;
  link?: string;
  url?: string;
}

export interface ApiAlbum {
  id: string | null;
  name: string | null;
  url?: string | null;
}

export interface ApiArtistRef {
  id: string;
  name: string;
  role?: string;
  type?: string;
  image?: ApiImage[];
  url?: string;
}

export interface ApiArtists {
  primary?: ApiArtistRef[];
  featured?: ApiArtistRef[];
  all?: ApiArtistRef[];
}

export interface ApiDownloadUrl {
  quality: string;
  link?: string;
  url?: string;
}

/** Search songs response item (PDF shape - uses link in image/downloadUrl) */
export interface ApiSearchSongItem {
  id: string;
  name: string;
  type?: string;
  album?: ApiAlbum;
  year?: string;
  releaseDate?: string | null;
  duration?: string;
  label?: string;
  primaryArtists?: string;
  primaryArtistsId?: string;
  featuredArtists?: string;
  featuredArtistsId?: string;
  explicitContent?: number;
  playCount?: string;
  language?: string;
  hasLyrics?: string;
  url?: string;
  copyright?: string;
  image?: ApiImage[];
  downloadUrl?: ApiDownloadUrl[];
  artists?: ApiArtists;
}

export interface ApiSearchSongsResponse {
  status?: string;
  success?: boolean;
  data: {
    results: ApiSearchSongItem[];
    total: number;
    start: number;
  };
}

/** Single song by ID response (docs shape - uses url in image/downloadUrl) */
export interface ApiSongItem {
  id: string;
  name: string;
  duration: number;
  language?: string;
  album?: { id: string; name: string };
  artists?: ApiArtists;
  image?: { quality: string; url: string }[];
  downloadUrl?: { quality: string; url: string }[];
}

export interface ApiSongResponse {
  success: boolean;
  data: ApiSongItem[];
}

export interface ApiSearchArtistItem {
  id: string;
  name: string;
  type?: string;
  image?: ApiImage[];
  url?: string;
}

export interface ApiSearchArtistsResponse {
  success?: boolean;
  data: { results: ApiSearchArtistItem[]; total?: number; start?: number };
}

export interface ApiSearchAlbumItem {
  id: string;
  name: string;
  description?: string;
  year?: string;
  type?: string;
  image?: ApiImage[];
  url?: string;
  artists?: ApiArtists;
  songCount?: number;
}

export interface ApiSearchAlbumsResponse {
  success?: boolean;
  data: { results: ApiSearchAlbumItem[]; total?: number; start?: number };
}

export interface ApiArtistItem {
  id: string;
  name: string;
  image?: ApiImage[];
  url?: string;
}

export interface ApiArtistSongsResponse {
  success?: boolean;
  data?: { results: ApiSearchSongItem[] };
}

export interface ApiAlbumSongsResponse {
  success?: boolean;
  data?: ApiSearchSongItem[] | { songs?: ApiSearchSongItem[] };
}
