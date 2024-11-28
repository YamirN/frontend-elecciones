import apiClient from "./axios";

export const fetchMesas = async () => {
    return await apiClient.get('/api/mesas');
};

export const createMesa = async (data) => {
    return await apiClient.post('/api/mesas', data, {
        headers: {
            'Content-Type': 'multipart/form-data', // Esto es importante para enviar archivos
        },
    });
};

export const deleteMesa = async (id) => {
    return await apiClient.delete(`/api/mesas/${id}`);
};