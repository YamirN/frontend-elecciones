import apiClient from './axios';

export const indexPartido = async () => {
    return apiClient.get('/partidos');
};

// export const indexPorEleccion = async (eleccionId) => {
//     return apiClient.get(`/candidatos/eleccion/${eleccionId}`);
// };

// // metodos a corregir
// export const createCandidate = async (data) => {
//     return await apiClient.post('/api/candidatos', data, {
//         headers: {
//             'Content-Type': 'multipart/form-data' // Esto es importante para enviar archivos
//         }
//     });
// };

// export const deleteCandidateById = async (candidateId) => {
//     try {
//         const response = await apiClient.delete(`/api/candidatos/${candidateId}`);
//         return response.data;
//     } catch (error) {
//         console.error('Error en la API al eliminar el candidato:', error);
//         throw error;
//     }
// };

// export const updateCandidate = async (candidateData) => {
//     try {
//         const response = await apiClient.put(`/api/candidatos/${candidateData.id}`, candidateData);

//         return response.data;
//     } catch (error) {
//         console.error('Error al actualizar el candidato:', error);
//         throw error;
//     }
// };
