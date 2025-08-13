import apiClient from './axios'; // Asegúrate de ajustar la ruta

export const fetchTodosEstudiantes = () => {
    return apiClient.get('/estudiantes/nombres'); // Endpoint sin paginación
};

export const fetchEstudiante = (page = 1) => {
    return apiClient.get(`/estudiantes?page=${page}`);
};

export const buscarEstudiantesConFiltro = async (filtros, page = 1) => {
    return apiClient.get('/estudiantes/buscar', {
        params: { ...filtros, page }
    });
};

export const createEstudiante = async (data) => {
    return apiClient.post('/estudiantes', data);
};

export const updateEstudiante = async (id, data) => {
    return apiClient.put(`/estudiantes/${id}`, data);
};

export const deleteEstudiante = async (id) => {
    return apiClient.delete(`/estudiantes/${id}`);
};

export const exportarEstudiantes = async () => {
    const response = await apiClient.get('/estudiantes/exportar', {
        responseType: 'blob'
    });
    return response.data; // <-- devolvemos solo el blob
};

export const importarEstudiantes = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Añadir el archivo al FormData

    return apiClient.post('/estudiantes/importar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data' // Asegurarse de que se reconoce como un archivo
        }
    });
};

// export const DeleteAllVoter = async () => {
//     return await apiClient.delete('/api/votantes-deleteall');
// };
