import { asignarAulas, createMesa, deleteMesa, exportarZip, fetchMesaAsignacion, fetchMesas, obtenerHistorialAsignacion, updateMesa } from '@/service/mesaSufragioService';
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
        errorExport: null,
        historialAsignacion: [],
        loadingHistorial: false
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
                    await this.ListarMesas(form.eleccion_id);
                    return true;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al crear la mesa.';
                this.errors = error.response?.data?.errors || {};
                return false;
            }
        },

        async actualizarMesa(id, form) {
            try {
                const response = await updateMesa(id, form);

                if (response.data) {
                    await this.ListarMesas(form.eleccion_id);
                    return true;
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Error al actualizar la mesa.';
                this.errors = error.response?.data?.errors || {};
                return false;
            }
        },

        async removeMesa(id, eleccionId) {
            try {
                await deleteMesa(id);
                await this.ListarMesas(eleccionId);
                return true;
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
        },
        async fetchHistorialAsignacion(mesaId) {
            this.loadingHistorial = true;
            try {
                this.historialAsignacion = await obtenerHistorialAsignacion(mesaId);
            } catch (error) {
                console.error('Error al cargar historial de asignación:', error);
                this.historialAsignacion = [];
            } finally {
                this.loadingHistorial = false;
            }
        }
    }
});
