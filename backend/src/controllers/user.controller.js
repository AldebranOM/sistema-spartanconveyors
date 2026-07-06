const pool = require('../config/database');

// ============================================
// OBTENER TODOS LOS USUARIOS
// ============================================
const getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nombre, email, rol, activo, created_at 
             FROM usuarios 
             ORDER BY id`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

// ============================================
// OBTENER USUARIO POR ID
// ============================================
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query(
            `SELECT id, nombre, email, rol, activo, created_at 
             FROM usuarios 
             WHERE id = ?`,
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ mensaje: 'Error al obtener usuario' });
    }
};


// ============================================
// CREAR USUARIO
// ============================================
const createUser = async (req, res) => {
    try {
        const { nombre, email, password, rol = 'usuario' } = req.body;
        
        const [existing] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }
        
        // TEMPORAL: Guardar contraseña en texto plano
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, password, rol]
        );
        
        const [newUser] = await pool.query(
            `SELECT id, nombre, email, rol, activo, created_at 
             FROM usuarios 
             WHERE id = ?`,
            [result.insertId]
        );
        
        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            usuario: newUser[0]
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ mensaje: 'Error al crear usuario' });
    }
};

// ============================================
// ACTUALIZAR USUARIO
// ============================================
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, rol } = req.body;
        
        const [existing] = await pool.query(
            'SELECT * FROM usuarios WHERE email = ? AND id != ?',
            [email, id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ mensaje: 'El email ya está registrado por otro usuario' });
        }
        
        await pool.query(
            'UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?',
            [nombre, email, rol, id]
        );
        
        res.json({ mensaje: 'Usuario actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ mensaje: 'Error al actualizar usuario' });
    }
};

// ============================================
// CAMBIAR ESTADO DEL USUARIO (ACTIVO/INACTIVO)
// ============================================
const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [user] = await pool.query(
            'SELECT activo FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (user.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        const nuevoEstado = user[0].activo === 1 ? 0 : 1;
        
        await pool.query(
            'UPDATE usuarios SET activo = ? WHERE id = ?',
            [nuevoEstado, id]
        );
        
        res.json({ 
            mensaje: `Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} exitosamente`,
            activo: nuevoEstado
        });
    } catch (error) {
        console.error('Error al cambiar estado del usuario:', error);
        res.status(500).json({ mensaje: 'Error al cambiar estado del usuario' });
    }
};

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================
const changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        
        await pool.query(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [password, id]
        );
        
        res.json({ mensaje: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
    }
};

// ============================================
// ELIMINAR USUARIO (SOLO ADMIN)
// ============================================
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [user] = await pool.query(
            'SELECT email FROM usuarios WHERE id = ?',
            [id]
        );
        
        if (user.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        
        if (user[0].email === 'admin@sistema.com') {
            return res.status(400).json({ mensaje: 'No se puede eliminar al administrador principal' });
        }
        
        await pool.query('DELETE FROM comentarios WHERE usuario_id = ?', [id]);
        await pool.query('DELETE FROM tickets WHERE usuario_id = ?', [id]);
        await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
        
        res.json({ mensaje: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ mensaje: 'Error al eliminar usuario' });
    }
};
// ============================================
// OBTENER USUARIOS ACTIVOS (PARA ASIGNAR)
// ============================================
const getActiveUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT id, nombre, email, rol 
             FROM usuarios 
             WHERE activo = 1 
             ORDER BY nombre`
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener usuarios activos:', error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};


module.exports = {
    getUsers,
    getUserById,
    getActiveUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    changePassword,
    deleteUser
};