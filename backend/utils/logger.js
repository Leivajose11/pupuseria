// backend/utils/logger.js
const sql = require('mssql');
const config = require('../dbConfig');

async function registrarLog(usuarioResponsableId, accion, modulo, descripcion) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('usuarioResponsableId', sql.Int, usuarioResponsableId)
      .input('accion', sql.VarChar, accion)
      .input('modulo', sql.VarChar, modulo)
      .input('descripcion', sql.VarChar, descripcion)
      .query(`
        INSERT INTO LogAuditoria (usuarioResponsableId, accion, modulo, descripcion, fechaHora)
        VALUES (@usuarioResponsableId, @accion, @modulo, @descripcion, GETDATE())
      `);
  } catch (err) {
    console.error('Error al registrar en log de auditoría:', err);
  }
}

module.exports = registrarLog;
