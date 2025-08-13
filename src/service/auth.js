import apiClient from './axios';

export const login = async (nombre_usuario, password) => {
    return await apiClient.post('/login', { nombre_usuario, password });
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

export const updatePerfil = async (datos) => {
    return apiClient.patch('/usuario/perfil', datos);
};

export const loginVotante = async (dni, password) => {
    return await apiClient.post('/estudiantes/login', { dni, password });
};
