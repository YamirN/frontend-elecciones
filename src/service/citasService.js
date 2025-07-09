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

export const asignarTrabajador = async (citaId, trabajadorId) => {
    const response = await apiClient.patch(`/citas/${citaId}/asignar-trabajador`, {
        trabajador_id: trabajadorId
    });
    return response.data;
};

export const obtenerTrabajadoresDisponibles = async (fecha, hora, citaId = null) => {
    const response = await apiClient.get('/trabajadores-disponibles', {
        params: { fecha, hora, cita_id: citaId }
    });
    return response.data.data;
};
