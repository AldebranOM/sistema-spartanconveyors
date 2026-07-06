import api from './api';

// Obtener todos los equipos
export const getInventory = async () => {
    const response = await api.get('/inventory');
    return response.data;
};

// Obtener un equipo por ID
export const getInventoryItem = async (id) => {
    const response = await api.get(`/inventory/${id}`);
    return response.data;
};

// Crear un equipo
export const createInventoryItem = async (data) => {
    const response = await api.post('/inventory', data);
    return response.data;
};

// Actualizar un equipo
export const updateInventoryItem = async (id, data) => {
    const response = await api.put(`/inventory/${id}`, data);
    return response.data;
};

// Eliminar un equipo
export const deleteInventoryItem = async (id) => {
    const response = await api.delete(`/inventory/${id}`);
    return response.data;
};

// Carga masiva desde Excel
export const bulkCreateInventory = async (items) => {
    const response = await api.post('/inventory/bulk', { items });
    return response.data;
};