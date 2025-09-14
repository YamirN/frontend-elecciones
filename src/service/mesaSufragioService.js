import apiClient from './axios';

export const fetchMesas = async (eleccionId) => {
    return await apiClient.get(`/elecciones/mesas/${eleccionId}`);
};

export const createMesa = async (data) => {
    return await apiClient.post('/mesas', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteMesa = async (id) => {
    return await apiClient.delete(`/api/mesas/${id}`);
};

export const asignarAulas = async (mesaId, aulas) => {
    return await apiClient.post(`/mesas/${mesaId}/asignar-aulas`, { aulas });
};

export const fetchMesaAsignacion = async (mesaId) => {
    return await apiClient.get(`/mesas/${mesaId}?mode=asignacion`);
};

export const obtenerAulasDisponibles = async (mesaId) => {
    const { data } = await apiClient.get(`/mesas/${mesaId}/aulas-disponibles`);
    return data;
};

export const exportarZip = async (mesaId) => {
    const response = await apiClient.get(`/mesas/${mesaId}/pdf`, {
        responseType: 'blob'
    });
    return response.data; // <-- devolvemos solo el blob
};
