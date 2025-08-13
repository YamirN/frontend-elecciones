import { createPartido, destroyPartido, getEleccionConPartidos, ObtenerPorEleccion, updatePartido } from '@/service/partidoService';
import { defineStore } from 'pinia';

export const usePartidoStore = defineStore('partidos', {
    state: () => ({
        eleccion: null,
        partidosPorEleccion: [],
        error: null,
        loading: false,
        errors: {}
    }),
    getters: {
        partidos: (state) => state.eleccion?.partidos || [],
        electionActive: (state) => !!state.eleccion,
        electionDetails: (state) => ({
            name: state.eleccion?.nombre_eleccion,
            startDate: state.eleccion?.fecha_inicio,
            endDate: state.eleccion?.fecha_fin
        })
    },
    actions: {
        async fetchEleccionConPartidos() {
            this.loading = true;
            this.error = null;
            try {
                const response = await getEleccionConPartidos();
                this.eleccion = response.data.data;
            } catch (err) {
                console.error('Error al obtener la elección:', err); // útil para debug
                this.error = err.response?.data?.message || 'Error al obtener elección activa';
                this.eleccion = null;
            } finally {
                this.loading = false;
            }
        },
        setLoading(value) {
            this.loading = value;
        },
        async ObtenerPartidosPorEleccion(eleccionId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await ObtenerPorEleccion(eleccionId);
                this.partidosPorEleccion = response.data.data;
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al obtener los partidos';
                this.partidosPorEleccion = [];
            } finally {
                this.loading = false;
            }
        },
        reset() {
            this.partidosPorEleccion = [];
            this.errors = null;
            this.loading = false;
        },
        async crearPartido(payload) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await createPartido(payload);

                return response.data;
            } catch (err) {
                this.errors = err.response?.data?.errors || {};
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async actualizarPartido(id, payload) {
            this.loading = true;
            this.errors = {};
            try {
                const response = await updatePartido(id, payload);

                return response.data;
            } catch (err) {
                this.errors = err.response?.data?.errors || {};
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async eliminarPartido(id) {
            this.loading = true;

            this.error = null;
            try {
                await destroyPartido(id);
                if (this.eleccion?.partidos) {
                    this.eleccion.partidos = this.eleccion.partidos.filter((p) => p.id !== id);
                }

                return true;
            } catch (err) {
                this.error = err.response?.data?.message || 'Error al eliminar partido';
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});
