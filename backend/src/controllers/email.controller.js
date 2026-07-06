
const pool = require('../config/database');
const { sendMassiveEmail, sendEmail } = require('../config/email');

// ============================================
// ENVIAR CORREOS MASIVOS
// ============================================
const sendMassive = async (req, res) => {
    try {
        const { asunto, mensaje, destinatarios, tipo } = req.body;
        const usuario_id = req.usuario.id;

        let recipients = [];
        let emails = [];

        if (tipo === 'todos') {
            const [rows] = await pool.query(
                'SELECT email FROM usuarios WHERE activo = 1 AND email IS NOT NULL'
            );
            emails = rows.map(r => r.email);
            recipients = 'Todos los usuarios activos';
        } else if (tipo === 'admin') {
            const [rows] = await pool.query(
                'SELECT email FROM usuarios WHERE rol = "admin" AND activo = 1 AND email IS NOT NULL'
            );
            emails = rows.map(r => r.email);
            recipients = 'Administradores';
        } else if (tipo === 'usuarios') {
            const [rows] = await pool.query(
                'SELECT email FROM usuarios WHERE rol = "usuario" AND activo = 1 AND email IS NOT NULL'
            );
            emails = rows.map(r => r.email);
            recipients = 'Usuarios';
        } else if (tipo === 'seleccionados' && destinatarios && destinatarios.length > 0) {
            emails = destinatarios;
            recipients = destinatarios.join(', ');
        } else {
            return res.status(400).json({ mensaje: 'Tipo de destinatario no válido' });
        }

        if (emails.length === 0) {
            return res.status(400).json({ mensaje: 'No hay destinatarios disponibles' });
        }

        const results = await sendMassiveEmail(emails, asunto, mensaje);

        await pool.query(
            `INSERT INTO correos_masivos (asunto, mensaje, destinatarios, enviado_por) 
             VALUES (?, ?, ?, ?)`,
            [asunto, mensaje, recipients, usuario_id]
        );

        res.status(200).json({
            mensaje: `Correos enviados exitosamente a ${emails.length} destinatarios`,
            total: emails.length,
            enviados: results.length
        });
    } catch (error) {
        console.error('❌ Error al enviar correos masivos:', error);
        res.status(500).json({ mensaje: 'Error al enviar los correos' });
    }
};

// ============================================
// OBTENER HISTORIAL DE CORREOS
// ============================================
const getEmailHistory = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT cm.*, u.nombre as enviado_por_nombre
             FROM correos_masivos cm
             JOIN usuarios u ON cm.enviado_por = u.id
             ORDER BY cm.created_at DESC`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ mensaje: 'Error al obtener historial' });
    }
};

// ============================================
// OBTENER USUARIOS PARA SELECCIONAR
// ============================================
const getEmailRecipients = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nombre, email FROM usuarios WHERE activo = 1 AND email IS NOT NULL'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener destinatarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener destinatarios' });
    }
};

// ============================================
// PROBAR CONFIGURACIÓN DE CORREO
// ============================================
const testEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const testSubject = '🔧 Prueba de configuración - Spartan Conveyors';
        const testHtml = `
            <h2 style="color: #5262DF;">🔧 Prueba de configuración de correo</h2>
            <p>Si estás recibiendo este correo, la configuración de correo está funcionando correctamente.</p>
            <p><strong>Spartan Conveyors - Sistema de Tickets</strong></p>
            <hr>
            <p style="font-size: 12px; color: #666;">Este es un correo de prueba enviado desde el sistema.</p>
            <p style="font-size: 12px; color: #666;">Fecha: ${new Date().toLocaleString()}</p>
        `;

        await sendEmail(email, testSubject, testHtml);
        res.json({ mensaje: 'Correo de prueba enviado exitosamente' });
    } catch (error) {
        console.error('❌ Error al enviar correo de prueba:', error);
        res.status(500).json({ mensaje: 'Error al enviar correo de prueba' });
    }
};

module.exports = {
    sendMassive,
    getEmailHistory,
    getEmailRecipients,
    testEmail
};