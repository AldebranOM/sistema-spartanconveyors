const { Pool } = require('pg');
require('dotenv').config();

// Configuración para PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'dpg-d963qbcs728c73f4fibg-a',
    user: process.env.DB_USER || 'sistema_tickets_j2x3_user',
    password: process.env.DB_PASSWORD || 'ZbOKkVK0KEJGZKWw1JRT7tZu4FlNZFqt',
    database: process.env.DB_NAME || 'sistema_tickets_j2x3',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = pool;