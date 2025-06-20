const sql = require('mssql');
const config = require('../dbConfig');

async function registrarLog(usuarioResponsableId, accion, entidad, entidadId, detalles) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('usuarioResponsableId', sql.Int, usuarioResponsableId)
      .input('accion', sql.VarChar, accion)
      .input('entidad', sql.VarChar, entidad)
      .input('entidadId', sql.Int, entidadId)
      .input('detalles', sql.VarChar, detalles)
      .query(`
        INSERT INTO LogsAuditoria (usuarioResponsableId, accion, entidad, entidadId, detalles, fecha)
        VALUES (@usuarioResponsableId, @accion, @entidad, @entidadId, @detalles, GETDATE())
      `);
  } catch (error) {
    console.error('Error al registrar log de auditoría:', error);
  }
}

module.exports = registrarLog;
