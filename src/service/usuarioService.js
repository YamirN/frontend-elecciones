import apiClient from './axios';

export const ListaUsuarios = () => {
    return apiClient.get('/usuarios');
};

export const ListaRoles = () => {
    return apiClient.get('/roles');
};

export const ListaPermisos = () => {
    return apiClient.get('/permisos');
};

export const AsignarPermisos = (roleId, data) => {
    return apiClient.post(`/roles/${roleId}/asignar-permisos`, data);
};

export const CreateUsuario = (data) => {
    return apiClient.post('/register', data);
};

export const UpdateUsuario = (id, data) => {
    return apiClient.put(`/usuarios/${id}`, data);
};

export const DeleteUsuario = (id) => {
    return apiClient.delete(`/usuarios/${id}`);
};

export const createRol = (data) => {
    return apiClient.post('/roles', data);
};

export const updateRol = (id, data) => {
    return apiClient.put(`/roles/${id}`, data);
};

export const deleteRol = (id) => {
    return apiClient.delete(`/roles/${id}`);
};
