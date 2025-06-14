const { sql, poolConnect } = require('./db');

async function testConnection() {
  try {
    const pool = await poolConnect; // Esperar la conexión y obtener el pool
    const result = await pool.request().query('SELECT GETDATE() AS fechaActual'); // Usar correctamente el pool
    console.log("✅ Conexión exitosa a SQL Server. Fecha actual:", result.recordset[0].fechaActual);
  } catch (err) {
    console.error("❌ Error al conectar con la base de datos:", err);
  }
}

testConnection();
