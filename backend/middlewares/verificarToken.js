const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ mensaje: 'Token inválido o expirado' });
    }

    // Desestructuramos toda la info útil del token
    const { id, nombre, usuario, rol } = decoded;

    req.usuarioId = id;
    req.usuario = { id, nombre, usuario, rol }; // Ahora tienes todo para los logs

    next();
  });
}

module.exports = verificarToken;
