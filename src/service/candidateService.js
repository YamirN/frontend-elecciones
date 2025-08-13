import apiClient from './axios';

export const obtenerCandidatos = async (id) => {
    return apiClient.get(`/candidatos/partido/${id}`);
};

export const asignarCandidatos = async (payload) => {
    return apiClient.post('/candidatos/asignar', payload);
};
