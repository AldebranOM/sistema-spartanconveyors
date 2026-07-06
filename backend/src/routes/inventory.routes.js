const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    bulkCreate
} = require('../controllers/inventory.controller');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas públicas (para usuarios autenticados)
router.get('/', getAllItems);
router.get('/:id', getItemById);

// Rutas solo para admin
router.post('/', adminMiddleware, createItem);
router.post('/bulk', adminMiddleware, bulkCreate);
router.put('/:id', adminMiddleware, updateItem);
router.delete('/:id', adminMiddleware, deleteItem);

module.exports = router;