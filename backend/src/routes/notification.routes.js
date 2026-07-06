const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require('../controllers/notification.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', getNotifications);
router.get('/no-leidas/count', getUnreadCount);
router.put('/:id/leer', markAsRead);
router.put('/leer-todas', markAllAsRead);

module.exports = router;