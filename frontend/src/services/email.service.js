import api from './api';

// Enviar correos masivos
export const sendMassiveEmail = async (data) => {
    const response = await api.post('/email/send', data);
    return response.data;
};

// Obtener historial de correos
export const getEmailHistory = async () => {
    const response = await api.get('/email/history');
    return response.data;
};

// Obtener destinatarios disponibles
export const getEmailRecipients = async () => {
    const response = await api.get('/email/recipients');
    return response.data;
};

// Probar configuración de correo
export const testEmail = async (email) => {
    const response = await api.post('/email/test', { email });
    return response.data;
};