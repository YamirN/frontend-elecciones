import { obtenerDashboard } from '@/service/dashboardService';
import { defineStore } from 'pinia';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        kpisTotales: {
            totalServiciosVendidos: 0,
            totalIngresos: 0,
            totalClientes: 0,
            totalTrabajadores: 0
        },
        kpisMensuales: {
            servicios: { valor: 0, variacion: 0 },
            ingresos: { valor: 0, variacion: 0 },
            clientes: { valor: 0, variacion: 0 }
        },
        serviciosPopulares: [],
        reservasRecientes: [],
        estadisticasRapidas: {
            reservasHoy: 0,
            enCurso: 0,
            pendientes: 0
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

                this.kpisTotales = response.kpis_totales;
                this.kpisMensuales = response.kpis_mensuales;
                this.serviciosPopulares = response.servicios_populares;
                this.reservasRecientes = response.reservas_recientes;
                this.estadisticasRapidas = response.estadisticas_rapidas;
                console.log(this.kpisTotales);
            } catch (err) {
                this.error = 'No se pudo cargar el dashboard';
                console.error(err);
            } finally {
                this.loading = false;
            }
        }
    }
});
