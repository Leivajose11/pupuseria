// C:\Users\Leiva\pupuseria\backend\utils\logger.js

const sql = require('mssql');
const config = require('../dbConfig');

/**
 * Registra una acción en la tabla de auditoría.
 * @param {Object} usuarioObj - objeto con info del usuario actual (req.usuario).
 * Debe contener al menos { id: number, usuario: string }.
 * @param {string} accion - acción ejecutada (ej. "CREAR_USUARIO").
 * @param {string} entidad - tabla o entidad afectada (ej. "Usuarios").
 * @param {number} entidadId - ID del registro afectado.
 * @param {string} detalles - descripción o detalles adicionales.
 */
async function registrarLog(usuarioObj, accion, entidad, entidadId, detalles) {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('usuarioResponsableId', sql.Int, usuarioObj.id) // Aquí usa usuarioObj.id
      .input('usuarioResponsableLogin', sql.VarChar, usuarioObj.usuario) // Aquí usa usuarioObj.usuario (el login)
      .input('accion', sql.VarChar, accion)
      .input('entidad', sql.VarChar, entidad)
      .input('entidadId', sql.Int, entidadId)
      .input('detalles', sql.VarChar, detalles)
      .query(`
        INSERT INTO LogsAuditoria 
        (usuarioResponsableId, usuarioResponsableLogin, accion, entidad, entidadId, detalles, fecha)
        VALUES (@usuarioResponsableId, @usuarioResponsableLogin, @accion, @entidad, @entidadId, @detalles, GETDATE())
      `);
    console.log(`Log registrado: Acción "${accion}" por usuario ${usuarioObj.usuario} en entidad "${entidad}"`); // Esto aparecerá en la consola de tu backend
  } catch (error) {
    console.error('*** ERROR al registrar log de auditoría:', error); // Importante para depurar
  }
}

module.exports = registrarLog;