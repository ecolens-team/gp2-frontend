import { api } from '../lib/axiosConfig';
import type { Quest } from '../interfaces/quest';

const transformQuest = (q: any): Quest => ({
  id: String(q.id),
  title: q.title,
  description: q.description,
  rules: q.rules || undefined,
  rewardPts: q.reward_pts ?? 0,
  progressPercent: q.user_progress ?? 0,
  isJoined: q.is_joined ?? false,
  category: q.category ?? 'GENERAL',
  image: q.image || undefined,
  startDate: q.start_date,
  endDate: q.end_date,
  recent_submissions: q.recent_submissions,
  leaderboard: q.leaderboard,
  totalParticipants: q.participant_count ?? 0,
  organizers: q.researcher_username
    ? [{ id: String(q.researcher), name: q.researcher_username, role: 'Researcher' }]
    : undefined,
});

export const getQuests = async (): Promise<Quest[]> => {
  const response = await api.get('/quests/');
  const data = response.data.results ?? response.data;
  return Array.isArray(data) ? data.map(transformQuest) : [];
};

export const getQuestById = async (id: string): Promise<Quest> => {
  const response = await api.get(`/quests/${id}/`);
  return transformQuest(response.data);
};

export const joinQuest = async (id: string): Promise<void> => {
  await api.post(`/quests/${id}/join/`);
};

export const submitObservationToQuest = async (questId: string, observationId: number): Promise<{
  observation_count: number;
  target_count: number;
  completed: boolean;
}> => {
  const response = await api.post(`/quests/${questId}/submit/`, { observation_id: observationId });
  return response.data;
};

export interface GamificationBadge {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  criteria_type: 'OBSERVATION_COUNT' | 'QUEST_COUNT' | 'FIRST_SPECIES' | null;
  criteria_value: number;
  earned: boolean;
}

export interface GamificationProfile {
  total_pts: number;
  level: number;
  level_name: string;
  xp_in_level: number;
  xp_per_level: number;
  badges: GamificationBadge[];
}

export const getGamificationProfile = async (): Promise<GamificationProfile> => {
  const response = await api.get('/quests/profile/');
  return response.data;
};
