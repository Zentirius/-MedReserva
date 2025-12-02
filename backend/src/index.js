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
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

    const schemaPath = path.join(__dirname, '..', 'migrations', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    await db.pool.query(sql);
    console.log('Migraciones ejecutadas correctamente.');
  } catch (err) {
    console.error('Error ejecutando migraciones:', err.message);
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
