export interface UserRecommendation {
  _id: string;
  user: {
    _id: string;
    username: string;
  };
  spotifyId: string;
  type: 'album' | 'artist' | 'track';
  review: string;
  isFeatured: boolean;
  createdAt: Date;
  metadata?: {
    spotifyId: string;
    type: string;
    title?: string;
    name?: string;
    imageUrl: string;
    artists?: { id: string; name: string }[];
  };
}
