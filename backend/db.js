const sql = require('mssql');

const dbConfig = {
  user: 'leivajose11',
  password: '12345678',
  server: 'localhost',
  database: 'RestauranteDB',
  options: {
    trustServerCertificate: true,
  },
};

const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('✅ Conexión a SQL Server exitosa');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error de conexión a SQL Server:', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise,
};
