const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('DATABASE_URL no está definida. Las consultas a la base de datos fallarán hasta configurarla.');
}

let pool = null;
if (connectionString) {
  pool = new Pool({ connectionString });
}

async function query(text, params) {
  if (!pool) {
    throw new Error('DATABASE_URL no está configurada');
  }
  return pool.query(text, params);
}

module.exports = {
  query,
  pool
};
