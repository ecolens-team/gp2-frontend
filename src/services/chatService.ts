import { api } from '../lib/axiosConfig';

export const getChats = async () => {
  const response = await api.get('/conversations/');
  return response.data;
};

export const getMessageHistory = async (id: number) => {
  const response = await api.get(`/conversations/${id}/messages/`);
  return response.data;
};

export const startConversation = async (userId: number) => {
  const response = await api.post('/conversations/', { user_id: userId });
  return response.data;
};
