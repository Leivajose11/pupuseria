const express = require('express');
const sql = require('mssql');
const router = express.Router();
const config = require('../dbConfig');
const verifyToken = require('../middlewares/verificarToken');
const verificarRol = require('../middlewares/verificarRol');

// OBTENER MENÚ COMPLETO (acceso libre)
router.get('/', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT m.id, m.nombre, m.descripcion, m.precio, m.disponible, 
             m.idCategoria, c.nombre AS categoria
      FROM Menu m
      JOIN CategoriaMenu c ON m.idCategoria = c.id
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener menú:', err);
    res.status(500).json({ mensaje: 'Error al obtener menú' });
  }
});

// CREAR producto (solo ADMIN)
router.post('/', verifyToken, verificarRol('administrador'), async (req, res) => {
  const { nombre, descripcion, precio, disponible, idCategoria } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('nombre', sql.VarChar, nombre)
      .input('descripcion', sql.VarChar, descripcion)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('disponible', sql.Bit, disponible)
      .input('idCategoria', sql.Int, idCategoria)
      .query(`
        INSERT INTO Menu (nombre, descripcion, precio, disponible, idCategoria)
        VALUES (@nombre, @descripcion, @precio, @disponible, @idCategoria)
      `);
    res.status(201).json({ mensaje: 'Producto creado' });
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
});

// ACTUALIZAR producto (solo ADMIN)
router.put('/:id', verifyToken, verificarRol('administrador'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, disponible, idCategoria } = req.body;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar, nombre)
      .input('descripcion', sql.VarChar, descripcion)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('disponible', sql.Bit, disponible)
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
    res.json({ mensaje: 'Producto actualizado' });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ mensaje: 'Error al actualizar producto' });
  }
});

// ELIMINAR producto (solo ADMIN)
router.delete('/:id', verifyToken, verificarRol('administrador'), async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Menu WHERE id = @id');
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
});

module.exports = router;
