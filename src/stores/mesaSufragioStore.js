import { asignarAulas, createMesa, deleteMesa, exportarZip, fetchMesaAsignacion, fetchMesas } from '@/service/mesaSufragioService';
import { downloadFile } from '@/service/utils/downloadFile';
import { defineStore } from 'pinia';

export const useMesaSufragioStore = defineStore('mesaSufragio', {
    state: () => ({
        mesas: [],
        error: null,
        errors: {},
        loading: false,
        mesaSeleccionada: null,
        aulasDisponibles: [],
        aulasSinAsignarTotal: [],
        loadingExportByMesa: {},
        errorExport: null
    }),

    actions: {
        async ListarMesas(eleccionId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await fetchMesas(eleccionId);
                this.mesas = response.data.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al cargar mesas';
                this.mesas = [];
            } finally {
                this.loading = false;
            }
        },

        reset() {
            this.mesas = [];
            this.error = null;
            this.loading = false;
        },

        async addMesa(form) {
            try {
                const response = await createMesa(form);

                if (response.data) {
                    await this.getMesas();
                    return true;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear la mesa.';
            }
        },
        async removeMesa(id) {
            try {
                await deleteMesa(id); // Llamar al servicio para eliminar
                await this.getMesas(); // Recargar mesas después de eliminar
                return true; // Operación exitosa
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al eliminar la mesa.';
                return false; // Fallo
            }
        },

        async asignarAulasAMesa(mesaId, aulas) {
            this.loading = true;
            this.errors = {};

            try {
                const response = await asignarAulas(mesaId, aulas);
                // Opcional: actualizar la mesa en el store
                const updatedMesa = response.data.data;
                const index = this.mesas.findIndex((m) => m.id === updatedMesa.id);
                if (index !== -1) {
                    this.mesas[index] = updatedMesa;
                }
                return true;
            } catch (error) {
                this.errors = error.response?.data?.errors || {};
                return false;
            } finally {
                this.loading = false;
            }
        },
        async cargarMesaParaAsignacion(mesaId) {
            const response = await fetchMesaAsignacion(mesaId);
            this.mesaSeleccionada = response.data.mesa;
            this.aulasDisponibles = response.data.aulas_disponibles;
            this.aulasSinAsignarTotal = response.data.aulas_sin_asignar_total;
        },
        async exportarZipDeMesa(mesaId) {
            this.loadingExportByMesa[mesaId] = true;
            this.errorExport = null;

            try {
                const blob = await exportarZip(mesaId);
                downloadFile(blob, `mesas_${mesaId}.zip`);
            } catch (err) {
                this.errorExport = err.response?.data?.message || 'Error al exportar ZIP';
                console.error(this.errorExport);
            } finally {
                setTimeout(() => {
                    this.loadingExportByMesa[mesaId] = false;
                }, 500);
            }
        }
    }
});
