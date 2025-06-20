// routes/logs.js
const express = require('express');
const sql = require('mssql');
const config = require('../dbConfig');
const router = express.Router();

// GET /logs - obtener todos los logs
router.get('/logs', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT 
        l.id, 
        u.nombre AS usuarioResponsable, 
        l.accion, 
        l.entidad AS tablaAfectada, 
        l.detalles AS detalle, 
        l.fecha
      FROM LogsAuditoria l
      LEFT JOIN Usuarios u ON l.usuarioResponsableId = u.id
      ORDER BY l.fecha DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener logs:', err);
    res.status(500).json({ mensaje: 'Error al cargar logs' });
  }
});

module.exports = router;
