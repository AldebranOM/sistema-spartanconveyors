import api from './api';

// Obtener todos los usuarios (solo admin)
export const getUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

// Obtener un usuario por ID
export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

// Crear un nuevo usuario
export const createUser = async (data) => {
    const response = await api.post('/users', data);
    return response.data;
};

// Actualizar un usuario
export const updateUser = async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

// Eliminar un usuario
export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

// Cambiar estado de un usuario (activo/inactivo)
export const toggleUserStatus = async (id) => {
    const response = await api.put(`/users/${id}/toggle`);
    return response.data;
};

// Cambiar contraseña de un usuario
export const changeUserPassword = async (id, data) => {
    const response = await api.put(`/users/${id}/password`, data);
    return response.data;
};
