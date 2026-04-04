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
  user?: string | { id?: number; username?: string };
  species?: ISpeciesApi | null;
  timestamp?: string;
  longitude?: number | null;
  latitude?: number | null;
  description?: string;
  confidence_level?: number | null;
  verified?: boolean;
  images?: IObservationImageApi[];
}

export interface IObservation {
  id: number;
  user: string;
  timestamp: string;
  speciesName: string;
  location: string;
  image: string | null;
  description: string;
  confidenceLevel: number | null;
  verified: boolean;
  latitude: number | null;
  longitude: number | null;
}
