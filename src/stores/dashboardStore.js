import { obtenerDashboard } from '@/service/dashboardService';
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        dashboardData: {
            kpis_totales: {},
            kpis_mensuales: {
                servicios: {},
                ingresos: {},
                clientes: {}
            },
            servicios_populares: [],
            estadisticas_rapidas: {},
            reservas_recientes: []
        },
        loading: false,
        error: null
    }),

    actions: {
        async cargarDashboard() {
            this.loading = true;
            this.error = null;

            try {
                const response = await obtenerDashboard();

                this.dashboardData = {
                    kpis_totales: response.kpis_totales || {},
                    kpis_mensuales: response.kpis_mensuales || {
                        servicios: {},
                        ingresos: {},
                        clientes: {}
                    },
                    servicios_populares: response.servicios_populares || [],
                    estadisticas_rapidas: response.estadisticas_rapidas || {},
                    reservas_recientes: response.reservas_recientes || []
                };
            } catch (err) {
                this.error = 'No se pudo cargar el dashboard';
                console.error(err);
            } finally {
                this.loading = false;
            }
        }
    }
});
