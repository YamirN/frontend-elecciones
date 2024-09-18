import apiClient from './axios'; // Asegúrate de ajustar la ruta

export const fetchUsers = async () => {
    try {
        const response = await apiClient.get('/users');
        return response.data.users || [];
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error; // Re-lanzar el error para manejarlo en el componente
    }
};

export const createUser = async (userData) => {
    try {
        const response = await apiClient.post('/users', userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error;
    }
};

export const updateUser = async (userData) => {
    try {
        const response = await apiClient.put(`/users/${userData.id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    }
};

export const deleteUserById = async (userId) => {
    try {
        const response = await apiClient.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error en la API al eliminar el usuario:', error);
        throw error;
    }
};
