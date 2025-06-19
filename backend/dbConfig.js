
const config = {
  user: 'leivajose11',        // <- cámbialo
  password: '12345678', // <- cámbialo
  server: 'localhost',
  database: 'RestauranteDB',
  options: {
    encrypt: false, // true si usas Azure
    trustServerCertificate: true
  }
};

module.exports = config;