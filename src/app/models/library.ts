import { ArtistReference } from './music';

export interface LibraryMetadata {
  itemType: 'track' | 'album' | 'artist';
  imageUrl: string;
  title?: string;
  artists?: ArtistReference[];
  name?: string;
}

export interface UserLibraryItem {
  _id: string;
  userId: string;
  spotifyItemId: string;
  itemType: 'track' | 'album' | 'artist';
  status: 'love' | 'explore' | 'listened';
  addedAt: string;
  metadata: LibraryMetadata;
}
