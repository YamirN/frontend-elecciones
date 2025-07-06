import apiClient from './axios'; // Asegúrate de ajustar la ruta

export const fetchTodosEstudiantes = () => {
    return apiClient.get('/estudiantes/nombres'); // Endpoint sin paginación
};

export const fetchEstudiante = (page = 1) => {
    return apiClient.get(`/estudiantes?page=${page}`);
};

export async function buscarEstudiantesPorNombre(nombre) {
    return apiClient.get('/estudiantes/buscar', { params: { nombre } });
}

// export const importVotantes = async (file) => {
//     const formData = new FormData();
//     formData.append('file', file); // Añadir el archivo al FormData

//     try {
//         const response = await apiClient.post('/api/import-votantes', formData, {
//             headers: {
//                 'Content-Type': 'multipart/form-data' // Asegurarse de que se reconoce como un archivo
//             }
//         });
//         return response.data; // Devuelve la respuesta del backend
//     } catch (error) {
//         console.error('Error al importar votantes:', error);
//         throw error; // Lanza el error para ser capturado en el store o componente
//     }
// };

// export const emitirVoto = async (dni, candidato_id, fecha_voto) => {
//     return await apiClient.post('/api/emitir-voto', { dni, candidato_id, fecha_voto });
// };

// export const logoutResponse = async () => {
//     try {
//         const response = await apiClient.post('/api/logout'); // Asegúrate de que esta ruta exista
//         return response.data;
//     } catch (logoutError) {
//         // console.error('Error al cerrar la sesión:', logoutError);
//         throw error;
//     }
// };

// Funcion para crear al estudiante
// export const createEstudiante = async (estudianteData) => {
//     try {
//         const response = await apiClient.post('/estudiantes', estudianteData);
//         return response.data;
//     } catch (error) {
//         // console.error('Error creating estudiante:', error);
//         throw error;
//     }
// };

// export const exportVotantes = async () => {
//     try {
//         const response = await apiClient.get('/api/votantes-exportar', {
//             responseType: 'blob' // Para manejar archivos de tipo Blob como Excel
//         });
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

// export const deleteVoterById = async (voterId) => {
//     try {
//         const response = await apiClient.delete(`/api/votantes/${voterId}`);
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };

// export const DeleteAllVoter = async () => {
//     return await apiClient.delete('/api/votantes-deleteall');
// };

// export const updateVoter = async (voterData) => {
//     try {
//         const response = await apiClient.put(`/api/votantes/${voterData.id}`, voterData);
//         return response.data;
//     } catch (error) {
//         throw error;
//     }
// };
