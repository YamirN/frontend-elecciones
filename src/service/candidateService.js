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

export const deleteCandidateById = async (candidateId) => {
    try {
        const response = await apiClient.delete(`/candidatos/${candidateId}`);
        return response.data;
    } catch (error) {
        console.error('Error en la API al eliminar el candidato:', error);
        throw error;
    }
};

export const updateCandidate = async (candidateData) => {
    try {
        const response = await apiClient.put(`/candidatos/${candidateData.id}`, candidateData);

        return response.data;
    } catch (error) {
        console.error('Error al actualizar el candidato:', error);
        throw error;
    }
};
