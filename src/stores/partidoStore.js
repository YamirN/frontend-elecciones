import { indexPartido } from '@/service/partidoService';
import { defineStore } from 'pinia';

export const usePartidoStore = defineStore('partidos', {
    state: () => ({
        partidos: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaPartido() {
            try {
                const response = await indexPartido();
                this.partidos = response.data;
                console.log('partidos cargados:', this.partidos);
            } catch (error) {
                this.errors = 'Error al cargar los partidos';
                console.error('Error loading partidos:', error);
            }
        }
        // async ListaCandidatosPorEleccion(eleccionId) {
        //     this.loading = true;
        //     this.error = null;
        //     try {
        //         const response = await indexPorEleccion(eleccionId);
        //         this.candidatos = response.data;
        //     } catch (error) {
        //         this.error = error.response?.data?.message || 'Error al cargar candidatos';
        //         this.candidatos = [];
        //     } finally {
        //         this.loading = false;
        //     }
        // },
        // async crearCandidato(form) {
        //     try {
        //         form.fecha_postulacion = formatDateForCreateUsers(form.fecha_postulacion);
        //         const response = await createCandidate(form);

        //         if (response.data.success) {
        //             await this.ObtenerCandidatos();
        //             return true;
        //         }
        //     } catch (error) {
        //         if (error.response && error.response.data && error.response.data.errors) {
        //             this.errors = error.response.data.errors; // Guardar los errores por cada campo
        //         } else {
        //             this.errors = { general: ['Error al crear el candidato'] }; // Error genérico si no hay detalles
        //         }
        //         console.error('Error creando candidato:', error);
        //         return false;
        //     }
        // },
        // reset() {
        //     this.candidatos = [];
        //     this.errors = null;
        //     this.loading = false;
        // }
        // async actualizarCandidato(form) {
        //     try {
        //         if (form.fecha_postulacion) {
        //             const formattedDate = formatDateForApi(form.fecha_postulacion);
        //             if (formattedDate) {
        //                 form.fecha_postulacion = formattedDate;
        //             }
        //         }

        //         await updateCandidate(form);
        //         await this.ObtenerCandidatos();
        //         return { success: true, message: 'Candidato actualizado' };
        //     } catch (error) {
        //         this.errors = error.response?.data?.errors || {};
        //         console.error('Error actualizando candidato:', error);
        //         return { success: false, error: this.errors };
        //     }
        // }
    }
});
