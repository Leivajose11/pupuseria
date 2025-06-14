const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/menu', require('./routes/menu'));
app.use('/api/categoria', require('./routes/categoria')); // 👈 Nueva ruta

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
