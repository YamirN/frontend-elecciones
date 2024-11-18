import apiClient from "./axios";

export const generarPdf = async (nivel, grado, seccion) => {
    return await apiClient.get('/generar-pdf', {
        params: { nivel, grado, seccion },
    });
};

export const generarListaHuella = async (nivel, grado, seccion) => {
    return await apiClient.get('/lista-votantes-firmas', {
        params: { nivel, grado, seccion },
    });
};

export const generarListaPendiente = async () => {
    return await apiClient.get('/pendientevotos');
};