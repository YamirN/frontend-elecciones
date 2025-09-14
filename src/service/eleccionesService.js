import apiClient from './axios';

export const indexEleccion = async () => {
    return apiClient.get('/elecciones');
};

export const createEleccion = async (data) => {
    return await apiClient.post('/elecciones', data);
};

export const cambiarEstadoEleccion = async (id, estado) => {
    return await apiClient.patch(`/elecciones/${id}/estado`, { estado });
};

export const destroyEleccion = async (id) => {
    return await apiClient.delete(`/elecciones/${id}`);
};

export const getMetricas = async (id) => {
    return await apiClient.get(`/elecciones/${id}/metricas`);
};
