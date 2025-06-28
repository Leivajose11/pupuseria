const express = require('express');
const sql = require('mssql');
const router = express.Router();
const config = require('../dbConfig');
const verificarToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol'); 

// Obtener todos los logs de auditoría
router.get('/logs', verificarToken, verificarRol('administrador'), async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request().query(`
            SELECT 
                l.id,
                l.usuarioResponsableLogin AS usuarioResponsable, 
                l.accion,
                l.entidad AS tablaAfectada, 
                l.detalles AS detalle,     
                -- ¡AJUSTE CLAVE AQUÍ! Formateamos la fecha a un string local directamente en SQL Server
                -- Esto asegura que Node.js reciba un string sin ambigüedades de zona horaria.
                FORMAT(l.fecha, 'yyyy-MM-dd HH:mm:ss') AS fechaStringLocal 
            FROM LogsAuditoria l  
            ORDER BY l.fecha DESC
        `);

        const logsFormateados = result.recordset.map(log => {
            return {
                ...log,
                // Ahora 'fechaStringLocal' ya viene como un string formateado (ej. "2025-06-28 14:42:38").
                // Lo enviamos tal cual al frontend.
                fecha: log.fechaStringLocal 
            };
        });

        res.json(logsFormateados);
    } catch (err) {
        console.error('Error al obtener logs:', err);
        res.status(500).json({ mensaje: 'Error al cargar logs de auditoría' });
    }
});

module.exports = router;