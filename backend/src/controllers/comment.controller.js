const pool = require('../config/database');

// Obtener comentarios de un ticket
const getCommentsByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const [rows] = await pool.query(
            `SELECT c.*, u.nombre as usuario_nombre 
             FROM comentarios c 
             JOIN usuarios u ON c.usuario_id = u.id 
             WHERE c.ticket_id = ? 
             ORDER BY c.created_at DESC`,
            [ticketId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener comentarios' });
    }
};

// Crear comentario
const createComment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { comentario, usuario_id } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO comentarios (ticket_id, usuario_id, comentario) VALUES (?, ?, ?)',
            [ticketId, usuario_id, comentario]
        );
        
        const [newComment] = await pool.query(
            `SELECT c.*, u.nombre as usuario_nombre 
             FROM comentarios c 
             JOIN usuarios u ON c.usuario_id = u.id 
             WHERE c.id = ?`,
            [result.insertId]
        );
        
        res.status(201).json(newComment[0]);
    } catch (error) {
        console.error('Error al crear comentario:', error);
        res.status(500).json({ mensaje: 'Error al crear comentario' });
    }
};

// Eliminar comentario
const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM comentarios WHERE id = ?', [id]);
        res.json({ mensaje: 'Comentario eliminado' });
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar comentario' });
    }
};

module.exports = {
    getCommentsByTicket,
    createComment,
    deleteComment
};