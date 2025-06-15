const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const menuRoutes = require('./routes/menu');
const categoriasRoutes = require('./routes/categorias');
const authRoutes = require('./routes/auth');

app.use('/api/menu', menuRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
