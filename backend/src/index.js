const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const db = require('./db');

dotenv.config();

const examenesRouter = require('./routes/examenes');
const reservasRouter = require('./routes/reservas');
const pagosRouter = require('./routes/pagos');
const distanciaRouter = require('./routes/distancia');
const authRouter = require('./routes/auth');

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['*'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  }
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  const orsKey = process.env.ORS_API_KEY;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.1.0',
    hasOrsKey: !!orsKey,
    orsKeyLength: orsKey ? orsKey.length : 0
  });
});

app.use('/api/examenes', examenesRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/distancia', distanciaRouter);
app.use('/api/auth', authRouter);

async function runMigrations() {
  try {
    if (!db.pool) {
      console.warn('No hay pool de base de datos inicializado; se omiten migraciones.');
      return;
    }

    // Verificar si ya existen las tablas
    const checkTable = await db.pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'examenes'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.log('Ejecutando migraciones iniciales...');
      const schemaPath = path.join(__dirname, '..', 'migrations', 'schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');
      
      // Ejecutar todo el SQL como una transacción
      const client = await db.pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log('Migraciones iniciales ejecutadas correctamente.');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    // Siempre ejecutar actualizaciones (viajes, ortografía, precios)
    console.log('Aplicando actualizaciones...');
    const updatesPath = path.join(__dirname, '..', 'migrations', 'updates.sql');
    if (fs.existsSync(updatesPath)) {
      const updatesSql = fs.readFileSync(updatesPath, 'utf8');
      await db.pool.query(updatesSql);
      console.log('Actualizaciones aplicadas correctamente.');
    }
  } catch (err) {
    console.error('Error ejecutando migraciones:', err.message);
    // No hacer crash del servidor, solo loguear
  }
}

async function start() {
  await runMigrations();

  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Servidor MedReserva escuchando en puerto ${port}`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
  process.exit(1);
});
