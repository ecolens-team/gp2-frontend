import type { LoginData } from "../interfaces/auth";
import { api } from "../lib/axiosConfig";

export const login = async(data: LoginData) => {
    try {
        const response = await api.post('/auth/login', data);
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

export const getUser = async() => {
    try {
        const response = await api.get('/auth/user');
        return response.data;
    }
    catch (error) {
        throw error;
    }
}

export const logout= async() => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    }
    catch (error) {
        throw error;
    }
}