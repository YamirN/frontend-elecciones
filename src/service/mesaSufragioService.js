import apiClient from "./axios";

export const fetchMesas = async () => {
    return await apiClient.get('/mesas');
};

export const createMesa = async (data) => {
    return await apiClient.post('/mesas', data, {
        headers: {
            'Content-Type': 'multipart/form-data', // Esto es importante para enviar archivos
        },
    });
};

export const deleteMesa = async (id) => {
    return await apiClient.delete(`/mesas/${id}`);
};