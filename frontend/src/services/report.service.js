import api from './api';

// Obtener estadísticas generales
export const getGeneralStats = async () => {
    const response = await api.get('/reports/general');
    return response.data;
};

// Obtener reporte de tickets por usuario
export const getTicketsByUser = async () => {
    const response = await api.get('/reports/tickets-by-user');
    return response.data;
};

// Obtener reporte de inventario
export const getInventoryReport = async () => {
    const response = await api.get('/reports/inventory');
    return response.data;
};

// Exportar reporte
export const exportReport = async (tipo) => {
    const response = await api.get(`/reports/export?tipo=${tipo}`);
    return response.data;
};