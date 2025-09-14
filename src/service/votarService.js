import apiClient from './axios'; // Asegúrate de ajustar la ruta

export const votar = (payload) => {
    return apiClient.post('/votar', payload);
};
