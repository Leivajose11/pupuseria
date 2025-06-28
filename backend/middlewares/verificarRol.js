function verificarRol(rolRequerido) {
  return (req, res, next) => {
    if (!req.usuario || !req.usuario.rol) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }

    if (req.usuario.rol.toLowerCase() !== rolRequerido.toLowerCase()) {
      return res.status(403).json({ mensaje: 'Acceso denegado: rol insuficiente' });
    }

    next();
  };
}

module.exports = verificarRol;
