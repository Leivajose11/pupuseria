const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Obtener todos los productos con nombre de categoría
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT m.*, c.nombre AS categoria
      FROM Menu m
      JOIN CategoriaMenu c ON m.idCategoria = c.id
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ GET error:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Agregar un nuevo producto
router.post('/', async (req, res) => {
  const { nombre, descripcion, precio, disponible, idCategoria } = req.body;
  if (!nombre || !descripcion || precio === undefined || idCategoria === undefined) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('disponible', sql.Bit, disponible ? 1 : 0)
      .input('idCategoria', sql.Int, idCategoria)
      .query(`
        INSERT INTO Menu (nombre, descripcion, precio, disponible, idCategoria)
        VALUES (@nombre, @descripcion, @precio, @disponible, @idCategoria)
      `);
    res.status(201).json({ message: 'Producto agregado' });
  } catch (error) {
    console.error('❌ POST error:', error);
    res.status(500).json({ error: 'Error al guardar producto' });
  }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, disponible, idCategoria } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.NVarChar, nombre)
      .input('descripcion', sql.NVarChar, descripcion)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('disponible', sql.Bit, disponible ? 1 : 0)
      .input('idCategoria', sql.Int, idCategoria)
      .query(`
        UPDATE Menu
        SET nombre = @nombre,
            descripcion = @descripcion,
            precio = @precio,
            disponible = @disponible,
            idCategoria = @idCategoria
        WHERE id = @id
      `);
    res.json({ message: 'Producto actualizado' });
  } catch (error) {
    console.error('❌ PUT error:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM Menu WHERE id = @id`);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('❌ DELETE error:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
