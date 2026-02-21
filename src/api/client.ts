const BASE_URL = 'https://saavn.sumit.co';

async function request<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

export const api = {
  searchSongs: (query: string, page = 1, limit = 20) =>
    request<import('@/types/api').ApiSearchSongsResponse>('/api/search/songs', {
      query,
      page: page - 1,
      limit,
    }),

  searchArtists: (query: string, page = 1, limit = 20) =>
    request<import('@/types/api').ApiSearchArtistsResponse>('/api/search/artists', {
      query,
      page: page - 1,
      limit,
    }),

  searchAlbums: (query: string, page = 1, limit = 20) =>
    request<import('@/types/api').ApiSearchAlbumsResponse>('/api/search/albums', {
      query,
      page: page - 1,
      limit,
    }),

  getSong: (id: string) =>
    request<import('@/types/api').ApiSongResponse>(`/api/songs/${id}`),

  getArtist: (id: string) =>
    request<{ success?: boolean; data?: import('@/types/api').ApiArtistItem }>(`/api/artists/${id}`),

  getArtistSongs: (id: string) =>
    request<import('@/types/api').ApiArtistSongsResponse>(`/api/artists/${id}/songs`),

  getAlbum: (id: string) =>
    request<{ success?: boolean; data?: unknown }>(`/api/albums/${id}`),
};
