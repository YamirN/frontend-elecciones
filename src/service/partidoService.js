import apiClient from './axios';

export const getEleccionConPartidos = async () => {
    return apiClient.get('/elecciones/partidos-activos');
};

export const ObtenerPorEleccion = async (eleccionId) => {
    return apiClient.get(`/elecciones/${eleccionId}/partidos`);
};

export const createPartido = async (data) => {
    return apiClient.post('/partidos', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updatePartido = async (id, data) => {
    data.append('_method', 'PUT'); // necesario para Laravel si envías archivos
    return apiClient.post(`/partidos/${id}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const destroyPartido = async (id) => {
    return await apiClient.delete(`/partidos/${id}`);
};
