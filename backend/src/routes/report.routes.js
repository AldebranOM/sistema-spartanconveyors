const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getGeneralStats,
    getTicketsByUser,
    getInventoryReport,
    exportTicketsReport
} = require('../controllers/report.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas (todas requieren admin)
router.get('/general', adminMiddleware, getGeneralStats);
router.get('/tickets-by-user', adminMiddleware, getTicketsByUser);
router.get('/inventory', adminMiddleware, getInventoryReport);
router.get('/export', adminMiddleware, exportTicketsReport);

module.exports = router;