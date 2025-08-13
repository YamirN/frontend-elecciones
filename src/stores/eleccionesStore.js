import { cambiarEstadoEleccion, createEleccion, destroyEleccion, indexEleccion } from '@/service/eleccionesService';
import { defineStore } from 'pinia';

export const useEleccionStore = defineStore('eleccion', {
    state: () => ({
        elecciones: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaEleccion() {
            this.loading = true;
            try {
                const response = await indexEleccion();
                this.elecciones = response.data;
                this.error = null;
            } catch (error) {
                this.errors = 'Error al cargar las elecciones';
                console.error('Error loading elecciones:', error);
            } finally {
                this.loading = false;
            }
        },
        async crearEleccion(data) {
            try {
                const response = await createEleccion(data);
                this.elecciones.push(response.data);
                return response.data;
            } catch (error) {
                this.errors = error.response?.data?.errors || {};
                throw error;
            }
        },
        async cambiarEstado(id, nuevoEstado) {
            try {
                const response = await cambiarEstadoEleccion(id, nuevoEstado);
                const index = this.elecciones.findIndex((e) => e.id === id);
                if (index !== -1) {
                    this.elecciones[index].estado = nuevoEstado;
                }
                return response.data;
            } catch (error) {
                console.error('Error al cambiar estado:', error);
                throw error;
            }
        },

        async eliminarEleccion(id) {
            try {
                await destroyEleccion(id);
                this.elecciones = this.elecciones.filter((e) => e.id !== id);
                return true;
            } catch (error) {
                console.error('Error al eliminar elección:', error);
                throw error;
            }
        }
    }
});
