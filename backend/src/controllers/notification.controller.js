const pool = require('../config/database');

// ============================================
// OBTENER NOTIFICACIONES DEL USUARIO
// ============================================
const getNotifications = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const [rows] = await pool.query(
            `SELECT n.*, t.titulo as ticket_titulo
             FROM notificaciones n
             LEFT JOIN tickets t ON n.ticket_id = t.id
             WHERE n.usuario_id = ?
             ORDER BY n.created_at DESC
             LIMIT 50`,
            [usuario_id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener notificaciones' });
    }
};

// ============================================
// CONTAR NOTIFICACIONES NO LEÍDAS
// ============================================
const getUnreadCount = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        const [rows] = await pool.query(
            'SELECT COUNT(*) as total FROM notificaciones WHERE usuario_id = ? AND leido = false',
            [usuario_id]
        );
        res.json({ total: rows[0].total });
    } catch (error) {
        console.error('Error al contar notificaciones:', error);
        res.status(500).json({ mensaje: 'Error al contar notificaciones' });
    }
};

// ============================================
// MARCAR NOTIFICACIÓN COMO LEÍDA
// ============================================
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.usuario.id;
        
        await pool.query(
            'UPDATE notificaciones SET leido = true WHERE id = ? AND usuario_id = ?',
            [id, usuario_id]
        );
        res.json({ mensaje: 'Notificación marcada como leída' });
    } catch (error) {
        console.error('Error al marcar notificación:', error);
        res.status(500).json({ mensaje: 'Error al marcar notificación' });
    }
};

// ============================================
// MARCAR TODAS COMO LEÍDAS
// ============================================
const markAllAsRead = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        await pool.query(
            'UPDATE notificaciones SET leido = true WHERE usuario_id = ?',
            [usuario_id]
        );
        res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
        console.error('Error al marcar todas:', error);
        res.status(500).json({ mensaje: 'Error al marcar todas las notificaciones' });
    }
};

// ============================================
// CREAR NOTIFICACIÓN (DESDE OTROS CONTROLADORES)
// ============================================
const crearNotificacion = async (usuario_id, ticket_id, tipo, mensaje, enlace = null) => {
    try {
        await pool.query(
            `INSERT INTO notificaciones (usuario_id, ticket_id, tipo, mensaje, enlace)
             VALUES (?, ?, ?, ?, ?)`,
            [usuario_id, ticket_id, tipo, mensaje, enlace]
        );
    } catch (error) {
        console.error('Error al crear notificación:', error);
    }
};

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    crearNotificacion
};