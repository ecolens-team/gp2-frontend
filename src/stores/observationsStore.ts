import { create } from 'zustand';
import type { IObservation } from '../interfaces/observations';
import { getObservations } from '../services/observationsService';

interface IObservationsState {
	observations: IObservation[];
	loading: boolean;
	error: string | null;
	fetchObservations: () => Promise<void>;
	clearError: () => void;
}

export const useObservationsStore = create<IObservationsState>((set) => ({
	observations: [],
	loading: false,
	error: null,
	fetchObservations: async () => {
		set({ loading: true, error: null });

		try {
			const observations = await getObservations();
			set({ observations, loading: false });
		} catch {
			set({
				loading: false,
				error: 'Failed to fetch observations. Please try again.',
			});
		}
	},
	clearError: () => set({ error: null }),
}));
