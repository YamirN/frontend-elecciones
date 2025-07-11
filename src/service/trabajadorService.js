import apiClient from './axios';

export const indexTrabajador = async () => {
    return apiClient.get('/trabajadores');
};

export const storeTrabajador = async (data) => {
    return await apiClient.post('/trabajadores', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updateTrabajador = async (id, data) => {
    return await apiClient.post(`/trabajadores/${id}?_method=PUT`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteTrabajador = async (id) => {
    return await apiClient.delete(`/trabajadores/${id}`);
};

export const updatePerfil = async (datos) => {
    return apiClient.patch('/trabajador/perfil', datos);
};
