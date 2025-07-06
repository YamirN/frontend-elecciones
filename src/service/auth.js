import apiClient from './axios';

export const login = async (email, password) => {
    return await apiClient.post('/login', { email, password });
};

export const logout = async () => {
    return await apiClient.post('/logout');
};

export const me = async () => {
    return await apiClient.get('/me');
};

export const refreshToken = async () => {
    return await apiClient.post('/refresh'); // Asume que devuelve { token: '...' }
};
