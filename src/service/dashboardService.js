import apiClient from './axios';

export const obtenerDashboard = async () => {
    try {
        const response = await apiClient.get('/admin/dashboard'); // ajusta el endpoint si es diferente
        return response.data;
    } catch (error) {
        console.error('Error al obtener dashboard:', error);
        throw error;
    }
};
