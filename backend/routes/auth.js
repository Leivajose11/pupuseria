// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// RUTA: POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  console.log('Recibido en login:', { usuario, password });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('usuario', sql.VarChar, usuario)
      .input('password', sql.VarChar, password)
      .query(`
        SELECT u.*, r.nombre AS rol
        FROM Usuarios u
        JOIN Roles r ON u.idRol = r.id
        WHERE u.usuario = @usuario AND u.password = @password
      `);

    console.log('Resultado:', result.recordset);

    if (result.recordset.length > 0) {
      const rol = result.recordset[0].rol;
      return res.json({ mensaje: 'Login exitoso', rol });
    } else {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
