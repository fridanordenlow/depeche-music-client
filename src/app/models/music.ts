export interface Album {
  id: string;
  uri: string;
  title: string;
  artists: ArtistReference[];
  type: 'album' | 'single' | 'compilation';
  group?: 'album' | 'single' | 'compilation' | 'appears_on';
  images: SpotifyImage[];
  releaseDate: string;
  totalTracks: number;
  tracks?: PaginatedResponse<Track>;
  label?: string;
  popularity?: number;
}

export interface AlbumReference {
  id: string;
  title: string;
  artists: ArtistReference[];
  imageUrl: string;
  type: 'album' | 'single' | 'compilation';
}

export type AlbumListResponse = PaginatedResponse<Album>;

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  popularity?: number;
}

export interface ArtistReference {
  id: string;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface SearchResponse {
  artists: PaginatedResponse<Artist>;
  albums: PaginatedResponse<Album>;
  tracks: PaginatedResponse<Track>;
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface Track {
  id: string;
  title: string;
  artists: ArtistReference[];
  album?: AlbumReference;
  durationMs: number;
  previewUrl: string | null;
  trackNumber: number;
  popularity?: number;
}
