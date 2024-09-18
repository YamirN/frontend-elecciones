import apiClient from "./axios";

export const fetchCandidatos = async () => {
    try {
        const response = await apiClient.get('/candidatos'); // Asegúrate de que la ruta es correcta
        return response.data;
    } catch (error) {
        console.error('Error fetching candidatos:', error);
        throw error;
    }
};
