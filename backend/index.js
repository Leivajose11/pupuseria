const express = require('express');
const cors = require('cors');
const app = express();
const port = 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
const menuRoutes = require('./routes/menu'); // Ya lo tienes
const categoriasRoutes = require('./routes/categorias'); // <--- ESTE DEBES AGREGARLO

app.use('/api/menu', menuRoutes);
app.use('/api/categorias', categoriasRoutes); // <--- Y ESTE TAMBIÉN

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
