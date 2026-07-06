import api from './api';

// Obtener notificaciones del usuario
export const getNotifications = async () => {
    const response = await api.get('/notificaciones');
    return response.data;
};

// Marcar una notificación como leída
export const markAsRead = async (id) => {
    const response = await api.put(`/notificaciones/${id}/leer`);
    return response.data;
};

// Marcar todas como leídas
export const markAllAsRead = async () => {
    const response = await api.put('/notificaciones/leer-todas');
    return response.data;
};

// Contar notificaciones no leídas
export const getUnreadCount = async () => {
    const response = await api.get('/notificaciones/no-leidas/count');
    return response.data;
};