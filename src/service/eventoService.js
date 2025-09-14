import apiClient from './axios';

// Devuelve todos los logs históricos sin filtros ni paginación
export const getLogs = () => {
    return apiClient.get('/logs');
};

// Devuelve todos los logs de votación sin filtros ni paginación
export const getLogsVotar = () => {
    return apiClient.get('/logs/votaciones');
};
