import { deleteServicio, indexServicio, storeServicio, updateServicio } from '@/service/servicioService';
import { defineStore } from 'pinia';

export const useServicioStore = defineStore('servicio', {
    state: () => ({
        servicios: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaServicio() {
            try {
                const response = await indexServicio();
                this.servicios = response.data.data;
            } catch (error) {
                this.errors = 'Error al cargar los servicios';
                console.error('Error loading servicios:', error);
            }
        },
        async crearServicio(formData) {
            this.errors = {};
            try {
                await storeServicio(formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    this.errors = error.response.data.errors;
                    return false;
                }
                console.error('Error inesperado al crear el servicio:', error);
                return false; // 👈 también devuelve false aquí
            }
        },

        async actualizarServicio(formData, id) {
            try {
                await updateServicio(id, formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    throw error;
                }
                console.error('Error al actualizar servicio:', error);
                throw new Error('Error inesperado al actualizar el servicio');
            }
        },

        async eliminarServicio(id) {
            try {
                await deleteServicio(id);
                return true;
            } catch (error) {
                console.error('Error al eliminar servicio:', error);
                return false;
            }
        }
    }
});
