import { api } from '../lib/axiosConfig';
import type { Quest } from '../interfaces/quest';

export const getQuests = async (): Promise<Quest[]> => {
  const response = await api.get('/quests/');
  return response.data.results || response.data;
};

export const getQuestById = async (id: string): Promise<Quest> => {
  try {
    const response = await api.get(`/quests/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching quest ${id}:`, error);
    throw error;
  }
};

export const joinQuest = async (id: string): Promise<void> => {
  try {
    await api.post(`/quests/${id}/join/`);
  } catch (error) {
    console.error(`Error joining quest ${id}:`, error);
    throw error;
  }
};
