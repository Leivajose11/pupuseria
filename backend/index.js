// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const categoriasRoutes = require('./routes/categorias');
const logsRoutes = require('./routes/logs');

const verificarToken = require('./middlewares/verificarToken');

app.use(cors());
app.use(express.json());

// 🔓 Login es la única ruta pública
app.use('/api/auth', authRoutes);

// 🔐 Desde aquí, todo requiere token
app.use(verificarToken);

// 🔒 Rutas protegidas
app.use('/api/menu', menuRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/logs', logsRoutes);

// 🔊 Servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
