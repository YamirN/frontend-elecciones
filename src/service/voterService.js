
import apiClient from './axios'; // Asegúrate de ajustar la ruta

// Funcion para crear al votante
export const createVoter = async (votanteData) => {
    try {
        const response = await apiClient.post('/votantes', votanteData);
        return response.data;

    } catch (error) {
        // console.error('Error creating votante:', error);
        throw error;
    }
};

export const emitirVoto = async (dni, candidato_id, fecha_voto) => {
    return await apiClient.post('/emitir-voto', { dni, candidato_id, fecha_voto });
};


export const logoutResponse = async () => {
    try {
        const response = await apiClient.post('/logout');  // Asegúrate de que esta ruta exista
        return response.data;
    } catch (logoutError) {
        // console.error('Error al cerrar la sesión:', logoutError);
        throw error;
    }

};


export const fetchVoter = async () => {
    return await apiClient.get('/votantes');
};

export const obtenerResultados = async () => {
    try {
        const response = await apiClient.get('/resultados');

        return response.data;
    } catch (error) {
        console.error('Error al obtener los resultados:', error);
        throw error;
    }
};


export const importVotantes = async (file) => {
    const formData = new FormData();
    formData.append('file', file); // Añadir el archivo al FormData

    try {
        const response = await apiClient.post('/import-votantes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Asegurarse de que se reconoce como un archivo
            }
        });
        return response.data; // Devuelve la respuesta del backend
    } catch (error) {
        console.error("Error al importar votantes:", error);
        throw error; // Lanza el error para ser capturado en el store o componente
    }
};


export const exportVotantes = async () => {
    try {
        const response = await apiClient.get('/votantes-exportar', {
            responseType: 'blob', // Para manejar archivos de tipo Blob como Excel
        });
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const deleteVoterById = async (voterId) => {
    try {
        const response = await apiClient.delete(`/votantes/${voterId}`);
        return response.data;
    } catch (error) {

        throw error;
    }
};

export const DeleteAllVoter = async () => {
    return await apiClient.delete('/votantes-deleteall');
};

export const updateVoter = async (voterData) => {
    try {
        const response = await apiClient.put(`/votantes/${voterData.id}`, voterData);
        return response.data;
    } catch (error) {

        throw error;
    }
};
