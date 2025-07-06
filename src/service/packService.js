import apiClient from './axios';

export const indexPack = async () => {
    return apiClient.get('/packs');
};

export const getPack = async (id) => {
    return apiClient.get(`/packs/${id}`);
};

export const storePack = async (data) => {
    return await apiClient.post('/packs', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updatePack = async (id, data) => {
    return await apiClient.post(`/packs/${id}?_method=PUT`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deletePack = async (id) => {
    return await apiClient.delete(`/packs/${id}`);
};
