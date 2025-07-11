// src/services/citasService.js
import apiClient from './axios';
import { formatFechaBackend } from './utils/formatFechaBackend';

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
    const fechaFormateada = formatFechaBackend(fecha); // <-- formato "2025-07-10"

    const params = {
        fecha: fechaFormateada,
        hora
    };

    if (citaId) {
        params.cita_id = citaId;
    }

    const response = await apiClient.get('/trabajadores-disponibles', { params });
    return response.data.data;
};

export function cambiarEstadoCita(citaId, estado) {
    return apiClient.patch(`/citas/${citaId}/cambiar-estado`, {
        estado: estado
    });
}

export const resumenDelDia = async () => {
    const response = await apiClient.get('/resumen');
    return response.data;
};

export const historialCitasAtendidas = async (params = {}) => {
    const response = await apiClient.get('/historial', { params });
    return response.data;
};
