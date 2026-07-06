const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { nombre, email, password, rol = 'usuario' } = req.body;
        
        const [existing] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ mensaje: 'El email ya está registrado' });
        }

        // Temporal: guardar contraseña en texto plano
        // const hashedPassword = await bcrypt.hash(password, 10);
        const plainPassword = password; // SOLO DESARROLLO
        
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, plainPassword, rol]
        );

        res.status(201).json({ 
            mensaje: 'Usuario registrado exitosamente',
            usuario: { id: result.insertId, nombre, email, rol }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const user = users[0];
        
        // Temporal: comparación directa (SOLO DESARROLLO)
        const validPassword = (password === user.password);
        // const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });
    } catch (error) {
        console.error('❌ Error en login:', error);
        console.error('❌ Detalle:', error.message);
        res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
    }
    
};



module.exports = { register, login };