import type { Quest } from './quest';

export interface ISpecies {
  id: number;
  scientificName: string;
  commonNameAr: string;
  commonNameEn: string;
  imageUrl: string;
  description: { text: string; isVerified: boolean };
  ecology: {
    isEndemic: boolean;
    isEndangered: boolean;
    isInvasive: boolean;
    habitats: string[];
    primaryGovernorates: string[];
  };
  community: {
    totalObservations: number;
    topObservers: { name: string; obs: number; avatar: string }[];
    topExperts: { name: string; title: string; avatar: string }[];
    activeQuests: Quest[];
  };
  dataInsights: {
    seasonality: number[];
    weather: { label: string; percent: number; color: string }[];
  };
}
