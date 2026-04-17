export interface IObservationImageApi {
  id?: number;
  image?: string;
  image_quality?: number | null;
  date?: string;
}

export interface ISpeciesApi {
  id?: number;
  scientific_name?: string;
  common_name_en?: string;
  common_name_ar?: string;
  description?: string;
  type?: 'PLANT' | 'INSECT';
}

export interface IObservationApi {
  id: number;
user?: string | { id?: number; username?: string; profile_picture?: string | null };  species: ISpeciesApi | null;
  timestamp?: string;
  longitude?: number | null;
  latitude?: number | null;
  description?: string;
  confidence_level?: number | null;
  verified?: boolean;
  images?: IObservationImageApi[];
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
}

export interface IObservationCommentApi {
  id: number;
  user?: string | { id?: number; username?: string; profile_picture?: string | null };   content?: string;
  text?: string;
  created_at?: string;
  timestamp?: string;
}

export interface IObservation {
  id: number;
  user: string;
  userProfilePicture: string | null;
  timestamp: string;
  speciesName: string;
  speciesId: number;
  location: string;
  image: string | null;
  images: string[];
  description: string;
  confidenceLevel: number | null;
  verified: boolean;
  latitude: number | null;
  longitude: number | null;
  likes: number;
  comments: number;
  hasLiked: boolean;
}

export interface IObservationComment {
  id: number;
  user: string;
  text: string;
  createdAt: string;
}
