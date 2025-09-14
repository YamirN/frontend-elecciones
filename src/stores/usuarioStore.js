import { AsignarPermisos, createRol, CreateUsuario, deleteRol, DeleteUsuario, ListaPermisos, ListaRoles, ListaUsuarios, updateRol, UpdateUsuario } from '@/service/usuarioService';
import { defineStore } from 'pinia';

export const useUsuarioStore = defineStore('usuarios', {
    state: () => ({
        usuarios: [],
        roles: [],
        permisos: [],
        errors: {},
        loading: false
    }),

    actions: {
        async obtenerUsuarios() {
            const response = await ListaUsuarios();
            this.usuarios = response.data;
        },
        async obtenerRoles() {
            const response = await ListaRoles();
            this.roles = response.data.data;
        },

        async obtenerPermisos() {
            const response = await ListaPermisos();
            this.permisos = response.data.permissions;
            return response.data;
        },

        async asignarPermisos(roleId, permisos) {
            this.loading = true;
            this.errors = null;

            try {
                const { data } = await AsignarPermisos(roleId, {
                    permissions: permisos
                });
                await this.obtenerRoles();

                return data;
            } catch (error) {
                this.errors = error.response?.data || error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async crearUsuario(data) {
            this.loading = true;
            this.errors = {};

            try {
                const response = await CreateUsuario(data);
                await this.obtenerUsuarios();
                return response.data;
            } catch (error) {
                this.errors = error.response?.data?.errors || {};
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async actualizarUsuario(id, data) {
            this.loading = true;
            this.errors = null;

            try {
                const response = await UpdateUsuario(id, data);
                await this.obtenerUsuarios();
                return response.data;
            } catch (error) {
                this.errors = error.response?.data || error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async eliminarUsuario(id) {
            this.loading = true;
            this.errors = null;

            try {
                const response = await DeleteUsuario(id);
                await this.obtenerUsuarios();
                return response.data;
            } catch (error) {
                this.errors = error.response?.data || error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async crearRol(data) {
            this.loading = true;
            this.errors = null;

            try {
                const response = await createRol(data);
                await this.obtenerRoles();
                return response.data;
            } catch (error) {
                this.errors = error.response?.data || error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async actualizarRol(id, data) {
            this.loading = true;
            this.errors = null;

            try {
                const response = await updateRol(id, data);
                await this.obtenerRoles();
                return response.data;
            } catch (error) {
                this.errors = error.response?.data || error;
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async eliminarRol(id) {
            this.loading = true;
            this.errors = null;

            try {
                const response = await deleteRol(id);
                await this.obtenerRoles();
                return response.data;
            } catch (error) {
                this.errors = error.response?.data || error;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});
