import api from './api';

// Obtener tickets del usuario autenticado
export const getMyTickets = async () => {
    const response = await api.get('/tickets/mis-tickets');
    return response.data;
};

// Obtener todos los tickets (admin)
export const getAllTickets = async () => {
    const response = await api.get('/tickets/admin/tickets');
    return response.data;
};

// Obtener un ticket por ID
export const getTicketById = async (id) => {
    const response = await api.get(`/tickets/${id}`);
    return response.data;
};

// Crear un ticket
export const createTicket = async (data) => {
    const response = await api.post('/tickets', data);
    return response.data;
};

// Actualizar estado de un ticket
export const updateTicketStatus = async (id, data) => {
    const response = await api.put(`/tickets/${id}/estado`, data);
    return response.data;
};

// Asignar un ticket a un usuario
export const assignTicket = async (id, data) => {
    const response = await api.put(`/tickets/${id}/asignar`, data);
    return response.data;
};

// Eliminar un ticket
export const deleteTicket = async (id) => {
    const response = await api.delete(`/tickets/${id}`);
    return response.data;
};