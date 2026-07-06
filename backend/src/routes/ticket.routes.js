const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    updateTicketStatus,
    assignTicket,
    deleteTicket
} = require('../controllers/ticket.controller');
const {
    getCommentsByTicket,
    createComment,
    deleteComment
} = require('../controllers/comment.controller');

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================
router.use(authMiddleware);

// ============================================
// RUTAS DE TICKETS
// ============================================

// Obtener tickets del usuario autenticado
router.get('/mis-tickets', getMyTickets);

// Obtener todos los tickets (solo admin)
router.get('/admin/tickets', adminMiddleware, getAllTickets);

// Obtener un ticket por ID
router.get('/:id', getTicketById);

// Crear un nuevo ticket
router.post('/', createTicket);

// Actualizar estado de un ticket
router.put('/:id/estado', updateTicketStatus);

// Asignar un ticket a un usuario
router.put('/:id/asignar', assignTicket);

// Eliminar un ticket (solo admin)
router.delete('/:id', adminMiddleware, deleteTicket);

// ============================================
// RUTAS DE COMENTARIOS
// ============================================

// Obtener comentarios de un ticket
router.get('/:ticketId/comments', getCommentsByTicket);

// Crear un comentario en un ticket
router.post('/:ticketId/comments', createComment);

// Eliminar un comentario
router.delete('/comments/:id', deleteComment);

module.exports = router;