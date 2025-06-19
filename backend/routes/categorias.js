const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM CategoriaMenu');
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

module.exports = router;
