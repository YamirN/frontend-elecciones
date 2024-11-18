import apiClient from "./axios";
export function isAuthenticatedAdmin() {
    // Aquí podrías verificar la autenticación a través de cookies, tokens, o un estado global
    return !!localStorage.getItem('authToken'); // Cambia esto según tu lógica
}

export const isAuthenticatedVoter = () => {
    return !!sessionStorage.getItem('authToken'); // Verifica la existencia del token en sessionStorage
};


export const loginVotante = async (dni) => {
    return await apiClient.post('/auth/votante/login', { dni });

};

export const loginAdmin = async (email, password) => {
    return await apiClient.post('/auth/login', { email, password });

};