const pool = require('../config/database');

// Obtener todos los equipos
const getAllItems = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM inventario ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener inventario:', error);
        res.status(500).json({ mensaje: 'Error al obtener el inventario' });
    }
};

// Obtener un equipo por ID
const getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM inventario WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'Equipo no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener equipo:', error);
        res.status(500).json({ mensaje: 'Error al obtener el equipo' });
    }
};

// Crear nuevo equipo
const createItem = async (req, res) => {
    try {
        console.log('📦 Body recibido COMPLETO:', JSON.stringify(req.body, null, 2));
        
        const {
            nombre,
            marca,
            modelo,
            serie,
            categoria,
            cantidad,
            precio,
            estado,
            ubicacion,
            observaciones,
            usuario_asignado
        } = req.body;

        console.log('📝 Datos a insertar:', {
            nombre: nombre || 'Sin nombre',
            marca: marca || '',
            modelo: modelo || '',
            serie: serie || '',
            categoria: categoria || 'General',
            cantidad: cantidad || 1,
            precio: precio || 0,
            estado: estado || 'Bueno',
            ubicacion: ubicacion || '',
            observaciones: observaciones || '',
            usuario_asignado: usuario_asignado || ''
        });

        const [result] = await pool.query(
            `INSERT INTO inventario 
            (nombre, marca, modelo, serie, categoria, cantidad, precio, estado, ubicacion, observaciones, usuario_asignado) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre || 'Sin nombre',
                marca || '',
                modelo || '',
                serie || '',
                categoria || 'General',
                cantidad || 1,
                precio || 0,
                estado || 'Bueno',
                ubicacion || '',
                observaciones || '',
                usuario_asignado || ''
            ]
        );

        console.log('✅ Equipo creado con ID:', result.insertId);

        res.status(201).json({
            mensaje: 'Equipo agregado exitosamente',
            id: result.insertId
        });
    } catch (error) {
        console.error('❌ Error al crear equipo:', error);
        res.status(500).json({ mensaje: 'Error al crear el equipo', error: error.message });
    }
};

// Actualizar equipo
const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre,
            marca,
            modelo,
            serie,
            categoria,
            cantidad,
            precio,
            estado,
            ubicacion,
            observaciones,
            usuario_asignado
        } = req.body;

        const [result] = await pool.query(
            `UPDATE inventario SET 
                nombre = ?, 
                marca = ?, 
                modelo = ?, 
                serie = ?, 
                categoria = ?, 
                cantidad = ?, 
                precio = ?, 
                estado = ?, 
                ubicacion = ?, 
                observaciones = ?, 
                usuario_asignado = ?
            WHERE id = ?`,
            [
                nombre || 'Sin nombre',
                marca || '',
                modelo || '',
                serie || '',
                categoria || 'General',
                cantidad || 1,
                precio || 0,
                estado || 'Bueno',
                ubicacion || '',
                observaciones || '',
                usuario_asignado || '',
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Equipo no encontrado' });
        }

        res.json({ mensaje: 'Equipo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(500).json({ mensaje: 'Error al actualizar el equipo' });
    }
};
// Eliminar equipo
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.query('DELETE FROM inventario WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Equipo no encontrado' });
        }

        res.json({ mensaje: 'Equipo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el equipo' });
    }
};

// Carga masiva desde Excel
const bulkCreate = async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ mensaje: 'No hay equipos para cargar' });
        }

        const values = items.map(item => [
            item.nombre || 'Sin nombre',
            item.marca || '',
            item.modelo || '',
            item.serie || '',
            item.categoria || 'General',
            parseInt(item.cantidad) || 1,
            parseFloat(item.precio) || 0,
            item.estado || 'Bueno',
            item.ubicacion || '',
            item.observaciones || '',
            item.usuario_asignado || ''
        ]);

        const [result] = await pool.query(
            `INSERT INTO inventario 
            (nombre, marca, modelo, serie, categoria, cantidad, precio, estado, ubicacion, observaciones, usuario_asignado) 
            VALUES ?`,
            [values]
        );

        res.status(201).json({
            mensaje: `${result.affectedRows} equipos cargados exitosamente`,
            total: result.affectedRows
        });
    } catch (error) {
        console.error('Error en carga masiva:', error);
        res.status(500).json({ mensaje: 'Error al cargar los equipos' });
    }
};
//exportacion de todos los modulos. 
module.exports = {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    bulkCreate
};