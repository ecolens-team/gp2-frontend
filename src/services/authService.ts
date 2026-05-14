import type { LoginData, RegistrationData } from '../interfaces/auth';
import { api } from '../lib/axiosConfig';

export const loginUser = async (data: LoginData) => {
  const response = await api.post('/auth/login/', data);
  return response.data;
};

export const registerUser = async (data: RegistrationData) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    const value = data[key as keyof RegistrationData];

    if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  const response = await api.post('/auth/registration/', formData);
  return response.data;
};

export const getUser = async () => {
  const response = await api.get('/auth/user/');
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout/');
  return response.data;
};

export type Specialization = { level: string; name: string; id?: number };

export const saveSpecializations = async (
  specializations: Specialization[],
) => {
  const response = await api.put('/me/specializations/', specializations);
  return response.data;
};

export const getSpecializations = async (): Promise<
  (Specialization & { id: number })[]
> => {
  const response = await api.get('/me/specializations/');
  return response.data;
};
