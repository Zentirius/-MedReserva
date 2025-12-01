const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const examenesRouter = require('./routes/examenes');
const reservasRouter = require('./routes/reservas');
const pagosRouter = require('./routes/pagos');
const distanciaRouter = require('./routes/distancia');

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/examenes', examenesRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/pagos', pagosRouter);
app.use('/api/distancia', distanciaRouter);

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Servidor MedReserva escuchando en puerto ${port}`);
});
