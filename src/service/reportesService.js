import apiClient from './axios';

export async function getTopServiciosMasReservados() {
    return await apiClient.get('/reportes/top-servicios');
}
