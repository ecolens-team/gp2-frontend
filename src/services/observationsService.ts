import type { IObservation, IObservationApi, IObservationImageApi, ISpeciesApi } from '../interfaces/observations';
import { api } from '../lib/axiosConfig';

export interface IObservationListApiResponse {
	results?: IObservationApi[];
}

export interface IObservationPayload {
	species: string,
	confidence_level: number,
	timestamp: string,
	description: string,
	longitude: number ,
	latitude: number,
	images: File[]
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

	return (
		species.common_name_en ||
		species.common_name_ar ||
		species.scientific_name ||
		'Unknown species'
	);
}

function getImageUrl(images: IObservationImageApi[] | undefined): string | null {
	const firstImage = images?.[0]?.image;

	if (!firstImage) {
		return null;
	}

	if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
		return firstImage;
	}

	const baseURL = api.defaults.baseURL ?? '';
	const backendOrigin = baseURL.replace(/\/api\/?$/, '');

	return `${backendOrigin}${firstImage}`;
}

function formatLocation(latitude: number | null | undefined, longitude: number | null | undefined): string {
	if (latitude == null || longitude == null) {
		return 'Unknown location';
	}

	return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function mapObservation(observation: IObservationApi): IObservation {
	return {
		id: observation.id,
		user: getUsername(observation.user),
		timestamp: observation.timestamp ?? '',
		speciesName: getSpeciesName(observation.species),
		location: formatLocation(observation.latitude, observation.longitude),
		image: getImageUrl(observation.images),
		description: observation.description ?? '',
		confidenceLevel: observation.confidence_level ?? null,
		verified: observation.verified ?? false,
		latitude: observation.latitude ?? null,
		longitude: observation.longitude ?? null,
	};
}

export const getObservations = async (): Promise<IObservation[]> => {
	try {
		const response = await api.get<IObservationApi[] | IObservationListApiResponse>('/observations/');
		const payload = Array.isArray(response.data) ? response.data : response.data.results ?? [];

		return payload.map(mapObservation);
	} catch (error) {
		throw error;
	}
};

export const getObservationById = async (id: number): Promise<IObservation> => {
	try {
		const response = await api.get<IObservationApi>(`/observations/${id}`);
		return mapObservation(response.data);
	} catch (error) {
		throw error;
	}
};


export const predictSpecies = async(image: File) => {
    try {
		const formData = new FormData();
        formData.append("image", image);
        const response = await api.post('/species/predict/', formData);
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

export const createObservation = async(payload: IObservationPayload) => {
    try {
		const formData = new FormData();
		payload.images.forEach(img => {
			formData.append("images", img);
		});
		formData.append("description", payload.description);
        formData.append("latitude", String(payload.latitude));
        formData.append("longitude", String(payload.longitude));
        
        formData.append("species_prediction", payload.species || "Unknown");
        formData.append("confidence_level", String(payload.confidence_level));
		formData.append("timestamp", payload.timestamp);
        
        const response = await api.post('/observations/', formData);
        return response.data;
    }
    catch (error) {
        throw error;
    }
}