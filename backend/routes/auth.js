const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('../dbConfig');
const registrarLog = require('../utils/logger');

// LOGIN
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('usuario', sql.VarChar, usuario)
      .query(`
        SELECT u.id, u.nombre, u.password, r.nombre AS rol
        FROM Usuarios u
        JOIN Roles r ON u.idRol = r.id
        WHERE u.usuario = @usuario AND u.activo = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }

    const usuarioData = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, usuarioData.password);

    if (!passwordMatch) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    res.json({
      id: usuarioData.id,
      nombre: usuarioData.nombre,
      rol: usuarioData.rol
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ mensaje: 'Error del servidor' });
  }
});

// REGISTRO
router.post('/register', async (req, res) => {
  const { nombre, usuario, password, idRol, usuarioResponsableId } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await sql.connect(config);

    const result = await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('usuario', sql.VarChar, usuario)
      .input('password', sql.VarChar, hashedPassword)
      .input('idRol', sql.Int, idRol)
      .query(`
        INSERT INTO Usuarios (nombre, usuario, password, idRol, activo, fechaRegistro)
        OUTPUT INSERTED.id
        VALUES (@nombre, @usuario, @password, @idRol, 1, GETDATE())
      `);

    const nuevoId = result.recordset[0].id;

    await registrarLog(usuarioResponsableId, 'CREAR_USUARIO', 'Usuarios', nuevoId, `Usuario '${nombre}' creado con rol ID ${idRol}`);

    res.status(201).json({ mensaje: 'Usuario registrado con éxito' });

  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// OBTENER TODOS LOS USUARIOS
router.get('/usuarios', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT u.id, u.nombre, u.usuario, r.id AS idRol, r.nombre AS rol, u.activo, u.fechaRegistro
      FROM Usuarios u
      JOIN Roles r ON u.idRol = r.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ mensaje: 'Error al cargar usuarios' });
  }
});

// ACTUALIZAR USUARIO
router.put('/usuarios/:id', async (req, res) => {
  const { nombre, usuario, password, idRol, activo, usuarioResponsableId } = req.body;
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    const request = pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('usuario', sql.VarChar, usuario)
      .input('idRol', sql.Int, idRol)
      .input('activo', sql.Bit, activo)
      .input('id', sql.Int, id);

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      request.input('password', sql.VarChar, hashedPassword);
      await request.query(`
        UPDATE Usuarios
        SET nombre = @nombre, usuario = @usuario, password = @password, idRol = @idRol, activo = @activo
        WHERE id = @id
      `);
    } else {
      await request.query(`
        UPDATE Usuarios
        SET nombre = @nombre, usuario = @usuario, idRol = @idRol, activo = @activo
        WHERE id = @id
      `);
    }

    await registrarLog(usuarioResponsableId, 'EDITAR_USUARIO', 'Usuarios', parseInt(id), `Usuario editado: ${nombre}`);

    res.json({ mensaje: 'Usuario actualizado' });

  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
});

// ELIMINAR USUARIO
router.delete('/usuarios/:id', async (req, res) => {
  const { usuarioResponsableId } = req.body;
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Usuarios WHERE id = @id');

    await registrarLog(usuarioResponsableId, 'ELIMINAR_USUARIO', 'Usuarios', parseInt(id), `Usuario ID ${id} eliminado permanentemente`);

    res.json({ mensaje: 'Usuario eliminado permanentemente' });

  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ mensaje: 'Error al eliminar usuario' });
  }
});

// DESACTIVAR USUARIO
router.patch('/usuarios/:id/desactivar', async (req, res) => {
  const { usuarioResponsableId } = req.body;
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Usuarios SET activo = 0 WHERE id = @id');

    await registrarLog(usuarioResponsableId, 'DESACTIVAR_USUARIO', 'Usuarios', parseInt(id), `Usuario desactivado`);

    res.json({ mensaje: 'Usuario desactivado' });

  } catch (err) {
    console.error('Error al desactivar usuario:', err);
    res.status(500).json({ mensaje: 'Error al desactivar usuario' });
  }
});

// REACTIVAR USUARIO
router.patch('/usuarios/:id/activar', async (req, res) => {
  const { usuarioResponsableId } = req.body;
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Usuarios SET activo = 1 WHERE id = @id');

    await registrarLog(usuarioResponsableId, 'REACTIVAR_USUARIO', 'Usuarios', parseInt(id), `Usuario reactivado`);

    res.json({ mensaje: 'Usuario activado' });

  } catch (err) {
    console.error('Error al activar usuario:', err);
    res.status(500).json({ mensaje: 'Error al activar usuario' });
  }
});

// OBTENER ROLES
router.get('/roles', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT id, nombre FROM Roles');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({ mensaje: 'Error al cargar roles' });
  }
});

module.exports = router;
