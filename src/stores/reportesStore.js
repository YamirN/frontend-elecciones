import { getTopServiciosMasReservados } from '@/service/reportesService';
import { defineStore } from 'pinia';

export const useReporteStore = defineStore('reporte', {
    state: () => ({
        topServicios: [],
        loading: false,
        errors: {}
    }),

    actions: {
        async cargarTopServicios() {
            this.loading = true;
            this.errors = {};

            try {
                const response = await getTopServiciosMasReservados();
                this.topServicios = response.data;
            } catch (error) {
                this.errors = error.response?.data || { message: 'Error al obtener reportes' };
                console.error('Error al obtener top servicios:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});
