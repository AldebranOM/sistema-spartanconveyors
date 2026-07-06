const pool = require('../config/database');

// ============================================
// ESTADÍSTICAS GENERALES
// ============================================
const getGeneralStats = async (req, res) => {
    try {
        // Total de tickets
        const [totalTickets] = await pool.query('SELECT COUNT(*) as total FROM tickets');
        
        // Tickets por estado
        const [ticketsByStatus] = await pool.query(`
            SELECT estado, COUNT(*) as cantidad 
            FROM tickets 
            GROUP BY estado
        `);
        
        // Tickets por prioridad
        const [ticketsByPriority] = await pool.query(`
            SELECT prioridad, COUNT(*) as cantidad 
            FROM tickets 
            GROUP BY prioridad
        `);
        
        // Tickets por mes (últimos 6 meses)
        const [ticketsByMonth] = await pool.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as mes,
                COUNT(*) as cantidad
            FROM tickets
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY mes ASC
        `);
        
        // Tickets por usuario
        const [ticketsByUser] = await pool.query(`
            SELECT 
                u.nombre,
                COUNT(t.id) as cantidad,
                SUM(CASE WHEN t.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados
            FROM usuarios u
            LEFT JOIN tickets t ON u.id = t.usuario_id
            GROUP BY u.id, u.nombre
            ORDER BY cantidad DESC
            LIMIT 10
        `);
        
        // Total de usuarios
        const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM usuarios WHERE activo = 1');
        
        // Tiempo promedio de resolución (tickets cerrados)
        const [avgResolution] = await pool.query(`
            SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_hours
            FROM tickets
            WHERE estado = 'cerrado'
        `);
        
        res.json({
            totalTickets: totalTickets[0].total,
            ticketsByStatus,
            ticketsByPriority,
            ticketsByMonth,
            ticketsByUser,
            totalUsers: totalUsers[0].total,
            avgResolution: avgResolution[0].avg_hours || 0
        });
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
    }
};

// ============================================
// REPORTE DE TICKETS POR USUARIO
// ============================================
const getTicketsByUser = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id,
                u.nombre,
                u.email,
                COUNT(t.id) as total_tickets,
                SUM(CASE WHEN t.estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
                SUM(CASE WHEN t.estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
                SUM(CASE WHEN t.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados
            FROM usuarios u
            LEFT JOIN tickets t ON u.id = t.usuario_id
            WHERE u.activo = 1
            GROUP BY u.id, u.nombre, u.email
            ORDER BY total_tickets DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error al obtener reporte por usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener reporte' });
    }
};

// ============================================
// REPORTE DE INVENTARIO
// ============================================
const getInventoryReport = async (req, res) => {
    try {
        // Total de equipos
        const [totalItems] = await pool.query('SELECT COUNT(*) as total FROM inventario');
        
        // Equipos por categoría
        const [itemsByCategory] = await pool.query(`
            SELECT categoria, COUNT(*) as cantidad 
            FROM inventario 
            GROUP BY categoria 
            ORDER BY cantidad DESC
        `);
        
        // Equipos por estado
        const [itemsByStatus] = await pool.query(`
            SELECT estado, COUNT(*) as cantidad 
            FROM inventario 
            GROUP BY estado 
            ORDER BY cantidad DESC
        `);
        
        // Últimos equipos agregados
        const [recentItems] = await pool.query(`
            SELECT * FROM inventario 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        // Valor total del inventario
        const [totalValue] = await pool.query(`
            SELECT SUM(cantidad * precio) as total_valor 
            FROM inventario 
            WHERE precio IS NOT NULL
        `);
        
        res.json({
            totalItems: totalItems[0].total,
            totalValue: totalValue[0].total_valor || 0,
            itemsByCategory,
            itemsByStatus,
            recentItems
        });
    } catch (error) {
        console.error('❌ Error al obtener reporte de inventario:', error);
        res.status(500).json({ mensaje: 'Error al obtener reporte de inventario' });
    }
};

// ============================================
// EXPORTAR REPORTE A EXCEL
// ============================================
const exportTicketsReport = async (req, res) => {
    try {
        const { tipo } = req.query;
        let data = [];
        
        if (tipo === 'usuarios') {
            const [rows] = await pool.query(`
                SELECT 
                    u.nombre,
                    u.email,
                    COUNT(t.id) as total_tickets,
                    SUM(CASE WHEN t.estado = 'abierto' THEN 1 ELSE 0 END) as abiertos,
                    SUM(CASE WHEN t.estado = 'en_proceso' THEN 1 ELSE 0 END) as en_proceso,
                    SUM(CASE WHEN t.estado = 'cerrado' THEN 1 ELSE 0 END) as cerrados
                FROM usuarios u
                LEFT JOIN tickets t ON u.id = t.usuario_id
                GROUP BY u.id, u.nombre, u.email
                ORDER BY total_tickets DESC
            `);
            data = rows;
        } else if (tipo === 'tickets') {
            const [rows] = await pool.query(`
                SELECT 
                    id,
                    titulo,
                    prioridad,
                    estado,
                    categoria,
                    usuario_id,
                    created_at
                FROM tickets
                ORDER BY created_at DESC
            `);
            data = rows;
        } else {
            return res.status(400).json({ mensaje: 'Tipo de reporte no válido' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('❌ Error al exportar reporte:', error);
        res.status(500).json({ mensaje: 'Error al exportar reporte' });
    }
};

module.exports = {
    getGeneralStats,
    getTicketsByUser,
    getInventoryReport,
    exportTicketsReport
};