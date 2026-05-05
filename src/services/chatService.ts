import { api } from "../lib/axiosConfig";

export const getChats = async () => {
    const response = await api.get('/conversations/');
    return response.data;
};

export const getMessageHistory = async (id: number) => {
    const response = await api.get(`/conversations/${id}/messages/`);
    return response.data;
};