import api from './api';

// Obtener comentarios de un ticket
export const getCommentsByTicket = async (ticketId) => {
    const response = await api.get(`/tickets/${ticketId}/comments`);
    return response.data;
};

// Crear un comentario en un ticket
export const createComment = async (ticketId, data) => {
    const response = await api.post(`/tickets/${ticketId}/comments`, data);
    return response.data;
};

// Eliminar un comentario
export const deleteComment = async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
};

// Subir archivo adjunto a un comentario
export const uploadAttachment = async (ticketId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/tickets/${ticketId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};