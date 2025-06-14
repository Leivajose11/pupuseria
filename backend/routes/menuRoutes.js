// backend/routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Tu misma configuración de conexión:
const dbConfig = {
  user: 'leivajose11',
  password: '12345678',
  server: 'localhost',
  database: 'RestauranteDB',
  options: { trustServerCertificate: true },
};

// Obtener todos los productos (con nombre de categoría)
router.get('/', async (req, res) => {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(`
      SELECT m.*, c.nombre AS categoria
      FROM Menu m
      JOIN CategoriaMenu c ON m.idCategoria = c.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener menú:', err.message);
    res.status(500).json({ error: 'Error al obtener menú' });
  }
});

// Crear nuevo producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, disponible, idCategoria } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query(`
      INSERT INTO Menu (nombre, descripcion, precio, disponible, idCategoria)
      VALUES (@nombre, @descripcion, @precio, @disponible, @idCategoria)
    `, [
      { name: 'nombre', type: sql.VarChar, value: nombre },
      { name: 'descripcion', type: sql.VarChar, value: descripcion },
      { name: 'precio', type: sql.Decimal(10, 2), value: precio },
      { name: 'disponible', type: sql.Bit, value: disponible },
      { name: 'idCategoria', type: sql.Int, value: idCategoria },
    ]);
    res.status(201).json({ mensaje: 'Producto creado' });
  } catch (err) {
    console.error('Error al crear producto:', err.message);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, disponible, idCategoria } = req.body;
  try {
    await sql.connect(dbConfig);
    await sql.query(`
      UPDATE Menu
      SET nombre = @nombre,
          descripcion = @descripcion,
          precio = @precio,
          disponible = @disponible,
          idCategoria = @idCategoria
      WHERE id = @id
    `, [
      { name: 'id', type: sql.Int, value: id },
      { name: 'nombre', type: sql.VarChar, value: nombre },
      { name: 'descripcion', type: sql.VarChar, value: descripcion },
      { name: 'precio', type: sql.Decimal(10, 2), value: precio },
      { name: 'disponible', type: sql.Bit, value: disponible },
      { name: 'idCategoria', type: sql.Int, value: idCategoria },
    ]);
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    console.error('Error al actualizar producto:', err.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await sql.connect(dbConfig);
    await sql.query('DELETE FROM Menu WHERE id = @id', [
      { name: 'id', type: sql.Int, value: id },
    ]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error('Error al eliminar producto:', err.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
