const pool = require('../config/database');

// ============================================
// FUNCIÓN PARA CREAR NOTIFICACIONES
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

// ============================================
// CREAR TICKET
// ============================================
const createTicket = async (req, res) => {
    try {
        const { titulo, descripcion, prioridad, categoria } = req.body;
        const usuario_id = req.usuario.id;

        const [result] = await pool.query(
            `INSERT INTO tickets 
            (titulo, descripcion, prioridad, categoria, usuario_id, estado) 
            VALUES (?, ?, ?, ?, ?, 'abierto')`,
            [titulo, descripcion, prioridad, categoria, usuario_id]
        );

        const [newTicket] = await pool.query(
            `SELECT t.*, u.nombre as usuario_nombre
             FROM tickets t 
             JOIN usuarios u ON t.usuario_id = u.id 
             WHERE t.id = ?`,
            [result.insertId]
        );

        // Crear notificación para el admin (si el usuario no es admin)
        if (req.usuario.rol !== 'admin') {
            // Obtener usuarios admin para notificar
            const [admins] = await pool.query(
                'SELECT id FROM usuarios WHERE rol = "admin" AND activo = 1'
            );
            for (const admin of admins) {
                await crearNotificacion(
                    admin.id,
                    result.insertId,
                    'nuevo',
                    `Nuevo ticket creado por ${req.usuario.nombre}: "${titulo}"`,
                    `/admin/tickets`
                );
            }
        }

        res.status(201).json({
            mensaje: 'Ticket creado exitosamente',
            ticket: newTicket[0]
        });
    } catch (error) {
        console.error('Error al crear ticket:', error);
        res.status(500).json({ mensaje: 'Error al crear ticket' });
    }
};

// ============================================
// OBTENER TICKETS DEL USUARIO AUTENTICADO
// ============================================
const getMyTickets = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;
        
        const [tickets] = await pool.query(
            `SELECT t.*, 
                    u.nombre as usuario_nombre,
                    a.nombre as asignado_nombre
             FROM tickets t 
             JOIN usuarios u ON t.usuario_id = u.id 
             LEFT JOIN usuarios a ON t.asignado_a = a.id 
             WHERE t.usuario_id = ? 
             ORDER BY t.created_at DESC`,
            [usuario_id]
        );

        res.json(tickets);
    } catch (error) {
        console.error('Error al obtener tickets del usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener tickets' });
    }
};

// ============================================
// OBTENER TODOS LOS TICKETS (ADMIN)
// ============================================
const getAllTickets = async (req, res) => {
    try {
        const [tickets] = await pool.query(
            `SELECT t.*, 
                    u.nombre as usuario_nombre,
                    a.nombre as asignado_nombre
             FROM tickets t 
             JOIN usuarios u ON t.usuario_id = u.id 
             LEFT JOIN usuarios a ON t.asignado_a = a.id 
             ORDER BY t.created_at DESC`
        );

        res.json(tickets);
    } catch (error) {
        console.error('Error al obtener todos los tickets:', error);
        res.status(500).json({ mensaje: 'Error al obtener tickets' });
    }
};

// ============================================
// OBTENER TICKET POR ID
// ============================================
const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [tickets] = await pool.query(
            `SELECT t.*, 
                    u.nombre as usuario_nombre,
                    a.nombre as asignado_nombre
             FROM tickets t 
             JOIN usuarios u ON t.usuario_id = u.id 
             LEFT JOIN usuarios a ON t.asignado_a = a.id 
             WHERE t.id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        res.json(tickets[0]);
    } catch (error) {
        console.error('Error al obtener ticket:', error);
        res.status(500).json({ mensaje: 'Error al obtener ticket' });
    }
};

// ============================================
// ACTUALIZAR ESTADO DEL TICKET (CON NOTIFICACIÓN)
// ============================================
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        // Obtener el ticket para saber quién lo creó
        const [ticket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);

        if (ticket.length === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        await pool.query(
            'UPDATE tickets SET estado = ? WHERE id = ?',
            [estado, id]
        );

        // Crear notificación para el creador del ticket (si no es el mismo que hizo el cambio)
        if (ticket[0].usuario_id !== req.usuario.id) {
            await crearNotificacion(
                ticket[0].usuario_id,
                id,
                'estado',
                `El estado de tu ticket "${ticket[0].titulo}" cambió a ${estado}`,
                `/tickets/${id}`
            );
        }

        res.json({ mensaje: 'Estado actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ mensaje: 'Error al actualizar estado' });
    }
};

// ============================================
// ASIGNAR TICKET A UN USUARIO (CON NOTIFICACIÓN)
// ============================================
const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { asignado_a } = req.body;

        // Obtener el ticket
        const [ticket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);

        if (ticket.length === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        await pool.query(
            'UPDATE tickets SET asignado_a = ? WHERE id = ?',
            [asignado_a, id]
        );

        // Crear notificación para el usuario asignado (si existe y no es el mismo que asignó)
        if (asignado_a && asignado_a !== req.usuario.id) {
            await crearNotificacion(
                asignado_a,
                id,
                'asignado',
                `Se te ha asignado el ticket "${ticket[0].titulo}"`,
                `/tickets/${id}`
            );
        }

        res.json({ mensaje: 'Ticket asignado exitosamente' });
    } catch (error) {
        console.error('Error al asignar ticket:', error);
        res.status(500).json({ mensaje: 'Error al asignar ticket' });
    }
};

// ============================================
// ELIMINAR TICKET (SOLO ADMIN)
// ============================================
const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM tickets WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Ticket no encontrado' });
        }

        res.json({ mensaje: 'Ticket eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar ticket:', error);
        res.status(500).json({ mensaje: 'Error al eliminar ticket' });
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getAllTickets,
    getTicketById,
    updateTicketStatus,
    assignTicket,
    deleteTicket
};