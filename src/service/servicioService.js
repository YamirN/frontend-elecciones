import apiClient from './axios';

export const indexServicio = async () => {
    return apiClient.get('/servicios');
};

export const storeServicio = async (data) => {
    return await apiClient.post('/servicios', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updateServicio = async (id, data) => {
    return await apiClient.post(`/servicios/${id}?_method=PUT`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteServicio = async (id) => {
    return await apiClient.delete(`/servicios/${id}`);
};

export const obtenerHorasDisponibles = async (data) => {
    return await apiClient.post('/citas/horas-disponibles', data);
};
