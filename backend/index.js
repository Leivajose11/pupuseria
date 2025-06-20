const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');         // <- AÑADIDO
const categoriasRoutes = require('./routes/categorias'); // <- AÑADIDO
const logsRoutes = require('./routes/logs');

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);                    // <- AÑADIDO
app.use('/api/categorias', categoriasRoutes);        // <- AÑADIDO
app.use('/api/logs', logsRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});


app.use('/api/logs', logsRoutes);
