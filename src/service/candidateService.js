import apiClient from "./axios";

export const fetchCandidate = async () => {
    try {
        const response = await apiClient.get('/candidatos');
        return response.data;
    } catch (error) {
        console.error('Error fetching candidatos:', error);
        throw error;
    }
};

export const createCandidate = async (data) => {
    try {
        const response = await apiClient.post('/candidatos', data, {
            headers: {
                'Content-Type': 'multipart/form-data', // Esto es importante para enviar archivos
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error;
    }
};
