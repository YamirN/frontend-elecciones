import apiClient from './axios';

export const indexCliente = async () => {
    return apiClient.get('/clientes');
};

export const registerCliente = async (data) => {
    return await apiClient.post('/clientes/register', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const updateCliente = async (id, data) => {
    return await apiClient.post(`/clientes/${id}?_method=PUT`, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteCliente = async (id) => {
    return await apiClient.delete(`/clientes/${id}`);
};
