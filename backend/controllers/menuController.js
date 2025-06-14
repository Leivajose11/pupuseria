// controllers/menuController.js
const { poolConnect, pool, sql } = require('../db');

const getMenu = async (req, res) => {
  try {
    await poolConnect;
    const result = await pool.request().query('SELECT * FROM Menu');
    res.json(result.recordset);
  } catch (err) {
    console.error('❌ Error exacto al obtener el menú:', err);  // <--- este log es clave
    res.status(500).json({ error: 'Error al obtener el menú' });
  }
};

module.exports = {
  getMenu
};
