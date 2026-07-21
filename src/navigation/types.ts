export type LibraryStackParamList = {
  LibraryHome: undefined;
  Artists: undefined;
  ArtistDetail: { artistName: string };
  Albums: undefined;
  AlbumDetail: { albumId: string; albumName: string; artistName: string };
  Playlists: undefined;
  PlaylistDetail: { playlistId: string; playlistName: string };
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
};

export type RootTabParamList = {
  LibraryTab: undefined;
  ArtistsTab: undefined;
  AlbumsTab: undefined;
  PlaylistsTab: undefined;
  SettingsTab: undefined;
};
