require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const ticketRoutes = require('./routes/ticket.routes');
const userRoutes = require('./routes/user.routes');
const emailRoutes = require('./routes/email.routes');
const reportRoutes = require('./routes/report.routes');
const notificationRoutes = require('./routes/notification.routes');



// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes); 
app.use('/api/reports', reportRoutes);
app.use('/api/notificaciones', notificationRoutes);


// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Sistema funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en puerto ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
    console.log(`📋 Rutas disponibles:`);
    console.log(`   - POST   /api/auth/login`);
    console.log(`   - POST   /api/auth/register`);
    console.log(`   - GET    /api/inventory`);
    console.log(`   - POST   /api/inventory`);
    console.log(`   - GET    /api/tickets/mis-tickets`);
    console.log(`   - POST   /api/tickets`);
    console.log(`   - GET    /api/tickets/:id`);
});