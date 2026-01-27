export interface UserRecommendation {
  _id: string;
  userId: string;
  spotifyId: string;
  type: 'album' | 'artist' | 'track';
  review: string;
  isFeatured: boolean;
  createdAt: Date;
  metadata?: {
    title?: string;
    name?: string;
    imageUrl?: string;
    artists?: { name: string }[];
  };
}
