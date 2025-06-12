const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Esto es lo que permite conexiones externas

app.use(express.json());

app.get('/api/dashboard', (req, res) => {
  res.json({
    ventasDelDia: 250.75,
    productoMasVendido: "Pupusa de Queso",
    empleadosActivos: 5
  });
});

app.listen(4000, () => {
  console.log('Servidor backend corriendo en http://localhost:4000');
});
