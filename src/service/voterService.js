
import apiClient from './axios'; // Asegúrate de ajustar la ruta

// Funcion para obtener al votante autenticado
export const fetchVoterData = async () => {
    try {
        // Obtener el token desde localStorage
        const token = sessionStorage.getItem('authToken');

        if (!token) {
            throw new Error('No se encontró el token de autenticación.');
        }

        // Realizar la solicitud API para obtener los datos del usuario
        const response = await apiClient.get('/me', {
            headers: {
                Authorization: `Bearer ${token}` // Enviar el token en los headers
            }
        });

        return response.data;

    } catch (error) {
        // console.error('Error obteniendo los datos del usuario:', error);
        throw error;
    }
};

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

export const emitirVoto = async (dni, candidatoId, fechaVoto) => {
    try {

        const response = await apiClient.post('/emitir-voto', {
            dni,
            candidato_id: candidatoId,
            fecha_voto: fechaVoto // Fecha correctamente formateada
        });
        return response.data;

    } catch (error) {
        // console.error('Error voting for candidate:', error);
        throw error;
    }
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

export const ObtenerNoVotantes = async () => {
    try {
        const response = await apiClient.get('/no-voto');
        return response.data;
    } catch (Error) {
        throw Error;
    }
};

export const ObtenerVotantes = async () => {
    try {
        const response = await apiClient.get('/CantidadVotantes');
        return response.data;
    } catch (Error) {
        throw Error;
    }
};
export const fetchVoter = async () => {
    try {
        const response = await apiClient.get('/votantes');
        return response.data;
    } catch (error) {

        throw error;
    }
};
export const ObtenerVotantesOk = async () => {
    try {
        const response = await apiClient.get('/voto');
        return response.data;
    } catch (Error) {
        throw Error;
    }
};

export const importVotantes = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/import-votantes', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        throw error.response.data;
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

export const updateVoter = async (voterData) => {
    try {
        const response = await apiClient.put(`/votantes/${voterData.id}`, voterData);
        return response.data;
    } catch (error) {

        throw error;
    }
};
