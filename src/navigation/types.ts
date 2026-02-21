export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
};

export type MainTabsParamList = {
  HomeTab: undefined;
  FavoritesTab: undefined;
  PlaylistsTab: undefined;
  SettingsTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Search: undefined;
  Queue: undefined;
  ArtistDetail: { artistId: string; artistName?: string };
  AlbumDetail: { albumId: string; albumName?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
    interface HomeParamList extends HomeStackParamList {}
  }
}
