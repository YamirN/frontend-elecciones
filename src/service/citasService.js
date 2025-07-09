// src/services/citasService.js
import apiClient from './axios';

export const crearCitaTemporal = async (payload) => {
    try {
        const response = await apiClient.post('/citas-temporales', payload);
        return response.data;
    } catch (error) {
        console.error('Error al crear cita temporal:', error);
        throw error;
    }
};

export const indexCita = async () => {
    return apiClient.get('/citas');
};

export const listarCitasPorCliente = async () => {
    return apiClient.get('/citas/clientes');
};

export const obtenerTrabajadoresDisponibles = async (fecha, hora) => {
    const response = await apiClient.get('/trabajadores-disponibles', {
        params: { fecha, hora }
    });
    return response.data.trabajadores;
};

export const asignarTrabajadorACita = async (citaId, trabajadorId) => {
    try {
        const response = await apiClient.put(`/citas/${citaId}/asignar-trabajador`, {
            trabajador_id: trabajadorId
        });
        return response.data;
    } catch (error) {
        console.error('Error al asignar trabajador:', error);
        throw error;
    }
};
