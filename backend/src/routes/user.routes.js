const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getUsers,
    getUserById,
    getActiveUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    changePassword,
    deleteUser
} = require('../controllers/user.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas (todas requieren admin)
router.get('/', adminMiddleware, getUsers);
router.get('/activos', adminMiddleware, getActiveUsers);
router.get('/:id', adminMiddleware, getUserById);
router.post('/', adminMiddleware, createUser);
router.put('/:id', adminMiddleware, updateUser);
router.put('/:id/toggle', adminMiddleware, toggleUserStatus);
router.put('/:id/password', adminMiddleware, changePassword);
router.delete('/:id', adminMiddleware, deleteUser);

module.exports = router;