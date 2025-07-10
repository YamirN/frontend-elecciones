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
            estadisticas_rapidas: {}
        },
        loading: false,
        errors: {}
    }),

    actions: {
        async cargarDashboard() {
            this.loading = true;
            this.error = null;

            try {
                const response = await obtenerDashboard();
                this.dashboardData = response;
            } catch (err) {
                this.error = 'No se pudo cargar el dashboard';
                console.error(err);
            } finally {
                this.loading = false;
            }
        }
    }
});
