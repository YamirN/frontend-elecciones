
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
        console.error('Error obteniendo los datos del usuario:', error);
        throw error;
    }
};

// Funcion para crear al votante
export const createVotante = async (votanteData) => {
    try {
        const response = await apiClient.post('/votantes', votanteData);
        return response.data;
    } catch (error) {
        console.error('Error creating votante:', error);
        throw error;
    }
};

export const voteForCandidate = async (dni, candidatoId) => {
    try {
        const now = new Date();
        const fechaVoto = now.toISOString().slice(0, 19).replace('T', ' '); // Formato compatible con MySQL

        // Realizar la solicitud de voto
        const response = await apiClient.post('/emitir-voto', {
            dni: dni,
            candidato_id: candidatoId,
            fecha_voto: fechaVoto // Fecha correctamente formateada
        });
        return response.data;
    } catch (error) {
        console.error('Error voting for candidate:', error);
        throw error;
    }
};

export const logoutResponse = async () => {
    try {
        const response = await apiClient.post('/logout');  // Asegúrate de que esta ruta exista
        return response.data;
    } catch (logoutError) {
        console.error('Error al cerrar la sesión:', logoutError);
        throw error;
    }

};

