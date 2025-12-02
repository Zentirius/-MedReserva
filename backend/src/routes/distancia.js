const express = require('express');
const { getDistanceKm } = require('../utils/geocode');

const router = express.Router();

router.get('/', async (req, res) => {
  const direccion = req.query.direccion;
  if (!direccion) {
    return res.status(400).json({ error: 'Parámetro direccion es obligatorio' });
  }

  const origin = process.env.BASE_ADDRESS || 'Santiago, Chile';

  try {
    const result = await getDistanceKm({ origin, destination: direccion });
    res.json(result);
  } catch (err) {
    console.error('Error calculando distancia:', err);
    res.status(500).json({ error: 'No se pudo calcular la distancia', detalle: err.message || 'Error desconocido' });
  }
});

module.exports = router;
