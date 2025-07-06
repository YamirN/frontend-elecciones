import { deletePack, getPack, indexPack, storePack, updatePack } from '@/service/packService';
import { defineStore } from 'pinia';

export const usePackStore = defineStore('pack', {
    state: () => ({
        packs: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaPack() {
            try {
                const response = await indexPack();
                this.packs = response.data.data;
            } catch (error) {
                this.errors = 'Error al cargar los packs';
                console.error('Error loading packs:', error);
            }
        },
        async obtenerPackPorId(id) {
            try {
                const response = await getPack(id);
                return response.data;
            } catch (error) {
                console.error('Error al obtener pack:', error);
                return null;
            }
        },
        async crearPack(formData) {
            this.errors = {};
            try {
                await storePack(formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    this.errors = error.response.data.errors;
                    return false;
                }
                console.error('Error inesperado al crear el pack:', error);
                return false;
            }
        },

        async actualizarPack(formData, id) {
            try {
                await updatePack(id, formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    throw error;
                }
                console.error('Error al actualizar pack:', error);
                throw new Error('Error inesperado al actualizar el pack');
            }
        },

        async eliminarPack(id) {
            try {
                await deletePack(id);
                return true;
            } catch (error) {
                console.error('Error al eliminar pack:', error);
                return false;
            }
        }
    }
});
