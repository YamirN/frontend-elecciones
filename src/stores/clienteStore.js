import { deleteCliente, indexCliente, registerCliente, updateCliente } from '@/service/clienteService';
import { defineStore } from 'pinia';

export const useClienteStore = defineStore('cliente', {
    state: () => ({
        clientes: [],
        error: null,
        loading: false,
        errors: {}
    }),

    actions: {
        async ListaCliente() {
            try {
                const response = await indexCliente();
                this.clientes = response.data.data;
            } catch (error) {
                this.errors = 'Error al cargar los clientes';
                console.error('Error loading clientes:', error);
            }
        },
        async registerCliente(formData) {
            this.errors = {};
            try {
                const response = await registerCliente(formData);
                return response.data;
            } catch (error) {
                if (error.response?.status === 422) {
                    this.errors = error.response.data.errors;
                } else {
                    console.error('Error inesperado al registrar cliente:', error);
                }
                return null;
            }
        },

        async actualizarCliente(formData, id) {
            try {
                await updateCliente(id, formData);
                return true;
            } catch (error) {
                if (error.response?.status === 422) {
                    this.errors = error.response.data.errors;
                    return false;
                }
                console.error('Error inesperado al crear el clientes:', error);
                return false; // 👈
            }
        },

        async eliminarCliente(id) {
            try {
                await deleteCliente(id);
                return true;
            } catch (error) {
                console.error('Error al eliminar clientes:', error);
                return false;
            }
        }
    }
});
