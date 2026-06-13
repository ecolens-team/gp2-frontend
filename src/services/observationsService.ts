import type {
  IObservation,
  IObservationApi,
  IObservationComment,
  IObservationCommentApi,
  ISpeciesApi,
} from '../interfaces/observations';
import type { ISpecies } from '../interfaces/species';
import { api } from '../lib/axiosConfig';

export interface IObservationListApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IObservationApi[];
}

export interface IObservationPage {
  observations: IObservation[];
  nextPage: number | null;
  count: number;
}

export interface IObservationPayload {
  species: string;
  confidence_level: number;
  timestamp: string;
  description: string;
  longitude: number;
  latitude: number;
  images: File[];
  weather?: string;
  governorate?: string;
}

export interface ILikeObservationResponse {
  liked?: boolean;
  has_liked?: boolean;
  likes_count?: number;
  likes?: number;
  message?: string;
}

export interface ICreateCommentPayload {
  content: string;
}

function getUsername(user: IObservationApi['user']): string {
  if (typeof user === 'string' && user.trim().length > 0) {
    return user;
  }

  if (user && typeof user === 'object' && user.username) {
    return user.username;
  }

  return 'Unknown user';
}

function getSpeciesName(species: ISpeciesApi | null | undefined): string {
  if (!species) {
    return 'Unknown species';
  }

  return species.scientific_name || 'Unknown species';
}

export function formatLocation(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): string {
  if (latitude == null || longitude == null) {
    return 'Unknown location';
  }

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

export function mapObservation(observation: IObservationApi): IObservation {
  return {
    id: observation.id,
    user: getUsername(observation.user),
    userProfilePicture:
      typeof observation.user === 'object'
        ? (observation.user?.profile_thumbnail ??
          observation.user?.profile_picture ??
          null)
        : null,
    timestamp: observation.timestamp ?? '',
    speciesName: getSpeciesName(observation.species),
    speciesId: observation.species?.id ?? 0,
    location: formatLocation(observation.latitude, observation.longitude),
    image: (observation.images && observation.images[0]) ?? null,
    images: observation.images || null,
    description: observation.description ?? '',
    confidenceLevel: observation.confidence_level ?? null,
    verified: observation.verified ?? false,
    latitude: observation.latitude ?? null,
    longitude: observation.longitude ?? null,
    comments: observation.comments_count,
    likes: observation.likes_count,
    hasLiked: observation.has_liked,
    assignedQuest: (observation as any).assigned_quest ?? null,
    governorate: observation.governorate,
  };
}

function mapObservationComment(
  comment: IObservationCommentApi,
): IObservationComment {
  return {
    id: comment.id,
    user: getUsername(comment.user),
    text: comment.content ?? comment.text ?? '',
    createdAt: comment.timestamp ?? comment.created_at ?? '',
  };
}

export interface IObservationFilters {
  location?: string;
  species?: string;
  min_confidence?: number;
  ordering?: string;
}

export const getObservationsByUser = async (
  username: string,
  filters: IObservationFilters = {},
): Promise<IObservation[]> => {
  const params = new URLSearchParams();
  params.append('user', username);
  if (filters.location) params.append('location', filters.location);
  if (filters.species) params.append('species', filters.species);
  if (filters.min_confidence !== undefined)
    params.append('min_confidence', String(filters.min_confidence));
  if (filters.ordering) params.append('ordering', filters.ordering);

  const response = await api.get<
    IObservationApi[] | IObservationListApiResponse
  >(`/observations/?${params.toString()}`);
  const payload = Array.isArray(response.data)
    ? response.data
    : (response.data.results ?? []);

  return payload.map(mapObservation);
};

export const getObservations = async (): Promise<IObservation[]> => {
  const response = await api.get<
    IObservationApi[] | IObservationListApiResponse
  >('/observations/');
  const payload = Array.isArray(response.data)
    ? response.data
    : (response.data.results ?? []);

  return payload.map(mapObservation);
};

export interface IFeedFilters {
  governorate?: string;
  min_confidence?: number;
  species?: string;
}

export const getObservationsPage = async ({
  pageParam,
  filters = {},
}: {
  pageParam: number;
  filters?: IFeedFilters;
}): Promise<IObservationPage> => {
  const params = new URLSearchParams({ page: String(pageParam), page_size: '5' });
  if (filters.governorate) params.set('governorate', filters.governorate);
  if (filters.min_confidence && filters.min_confidence > 0)
    params.set('min_confidence', String(filters.min_confidence));
  if (filters.species) params.set('species', filters.species);

  const response = await api.get<IObservationListApiResponse>(
    `/observations/?${params.toString()}`,
  );
  return {
    observations: response.data.results.map(mapObservation),
    nextPage: response.data.next ? pageParam + 1 : null,
    count: response.data.count,
  };
};

export const getObservationLocations = async (
  filters: IFeedFilters = {},
): Promise<IObservation[]> => {
  const params = new URLSearchParams({ page_size: '200' });
  if (filters.governorate) params.set('governorate', filters.governorate);
  if (filters.min_confidence && filters.min_confidence > 0)
    params.set('min_confidence', String(filters.min_confidence));
  if (filters.species) params.set('species', filters.species);
  const response = await api.get<IObservationListApiResponse>(
    `/observations/?${params.toString()}`,
  );
  return response.data.results.map(mapObservation);
};

export const getObservationById = async (id: number): Promise<IObservation> => {
  const response = await api.get<IObservationApi>(`/observations/${id}`);
  return mapObservation(response.data);
};

export const likeObservation = async (
  id: number,
): Promise<ILikeObservationResponse> => {
  const response = await api.post<ILikeObservationResponse>(
    `/observations/${id}/like/`,
  );
  return response.data ?? {};
};

export const getObservationComments = async (
  id: number,
): Promise<IObservationComment[]> => {
  const response = await api.get<IObservationCommentApi[]>(
    `/observations/${id}/comments/`,
  );
  const payload = Array.isArray(response.data) ? response.data : [];
  return payload.map(mapObservationComment);
};

export const createObservationComment = async (
  id: number,
  payload: ICreateCommentPayload,
): Promise<IObservationComment> => {
  const response = await api.post<IObservationCommentApi>(
    `/observations/${id}/comments/`,
    payload,
  );
  return mapObservationComment(response.data);
};

function resizeImageForPrediction(file: File, size = 224): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, size, size);
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')),
        'image/jpeg',
        0.9,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

export const predictSpecies = async (image: File) => {
  const resized = await resizeImageForPrediction(image);
  const formData = new FormData();
  formData.append('image', resized, 'image.jpg');
  const response = await api.post('/species/predict/', formData, {
    timeout: 120000,
  });
  return response.data;
};

export const createObservation = async (payload: IObservationPayload) => {
  const formData = new FormData();
  payload.images.forEach((img) => {
    formData.append('images', img);
  });
  formData.append('description', payload.description);
  formData.append('latitude', String(payload.latitude));
  formData.append('longitude', String(payload.longitude));

  formData.append('species_prediction', payload.species || 'Unknown');
  formData.append('confidence_level', String(payload.confidence_level));
  formData.append('timestamp', payload.timestamp);
  if (payload.weather) formData.append('weather', payload.weather);
  if (payload.governorate) formData.append('governorate', payload.governorate);

  const response = await api.post('/observations/', formData);
  return response.data;
};

export const getSpeciesById = async (id: number): Promise<ISpecies> => {
  const response = await api.get<ISpecies>(`/species/${id}`);
  return response.data;
};

export const verifyObservation = async (
  observationId: number,
  speciesId: number,
) => {
  const response = await api.patch(`/observations/${observationId}/verify/`, {
    species_id: speciesId,
  });
  return response.data;
};

export interface ISpeciesUpdatePayload {
  description?: string;
  description_is_verified?: boolean;
  is_endangered?: boolean;
  is_invasive?: boolean;
  is_endemic?: boolean;
  common_name_en?: string;
  common_name_ar?: string;
}

export const updateSpecies = async (
  id: number,
  payload: ISpeciesUpdatePayload,
): Promise<void> => {
  await api.patch(`/species/${id}/update/`, payload);
};

export const getSpeciesList = async (): Promise<ISpecies[]> => {
  const response = await api.get<ISpecies[]>('/species/');
  return response.data;
};
