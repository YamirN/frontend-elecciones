import { DeleteAllVoter, fetchVoter, importVotantes } from '@/service/voterService';
import { defineStore } from 'pinia';

export const useVoterStore = defineStore('votante', {
    state: () => ({
        votantes: [],
        error: null,
        errors: {},
        loading: false,
        successMessage: null,
        errorMessage: null,
    }),

    actions: {
        async ObtenerVotantes() {
            try {
                const response = await fetchVoter();
                this.votantes = response.data.votante;
            } catch (error) {
                this.errors = 'Error al cargar los candidatos';
                console.error('Error loading candidatos:', error);
            }
        },
        async EliminarTodosLosVotantes() {
            try {
                await DeleteAllVoter();

                this.votantes = []; // Limpia la lista localmente
                return true;
            } catch (error) {
                // Maneja errores, por ejemplo, mostrando un mensaje de error
                console.error('Error eliminando votantes:', error);
                this.error = error.response?.data?.error || 'Error desconocido al eliminar los votantes';
                return false;
            }
        },
        async importarVotantes(file) {
            this.loading = true;  // Iniciar la carga
            this.successMessage = null; // Limpiar el mensaje de éxito previo
            this.errorMessage = null; // Limpiar el mensaje de error previo

            try {
                const response = await importVotantes(file); // Llamada al servicio
                if (response.success) {
                    await this.ObtenerVotantes();
                    this.successMessage = response.message; // Mensaje de éxito
                    return true; // Mostrar mensaje de éxito
                } else {
                    this.errorMessage = response.message; // Mensaje de error específico
                    throw new Error(response.message);
                }
            } catch (error) {
                // Manejo de errores: si hay detalles en el error de la API, úsalos
                if (error.response?.data?.message) {
                    this.errorMessage = error.response.data.message; // Mensaje del backend
                } else if (error.message) {
                    this.errorMessage = error.message; // Mensaje genérico del error
                } else {
                    this.errorMessage = 'Ocurrió un error inesperado al importar los votantes.';
                }
                throw new Error(this.errorMessage); // Lanza el error para ser capturado
            } finally {
                this.loading = false; // Finalizar la carga
            }
        }

    },
});