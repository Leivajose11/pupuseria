const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const dbConfig = require('../db');

const JWT_SECRET = 'tu_clave_secreta_segura'; // pon esto en una variable de entorno si deseas más seguridad

exports.login = async (req, res) => {
  const { usuario, contraseña } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('usuario', sql.NVarChar, usuario)
      .query(`
        SELECT u.id, u.nombre, u.usuario, u.contraseña, r.nombre AS rol
        FROM Usuarios u
        INNER JOIN Roles r ON u.idRol = r.id
        WHERE u.usuario = @usuario AND u.activo = 1
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado o inactivo' });
    }

    const passwordMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!passwordMatch) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, nombre: user.nombre, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, usuario: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
};
