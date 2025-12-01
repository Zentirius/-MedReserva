const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/verificar', async (req, res) => {
  const payload = req.body || {};
  const { reserva_id, proveedor, referencia, monto, moneda, estado } = payload;

  try {
    let pagoId = null;
    try {
      const result = await db.query(
        'INSERT INTO pagos (reserva_id, proveedor, referencia, monto, moneda, estado, raw_payload) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
        [
          reserva_id || null,
          proveedor || null,
          referencia || null,
          monto != null ? parseInt(monto, 10) : null,
          moneda || null,
          estado || null,
          payload
        ]
      );
      pagoId = result.rows[0]?.id;
    } catch (errDb) {
      console.error('Error guardando pago en base de datos:', errDb.message);
    }

    res.json({ ok: true, id: pagoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar pago' });
  }
});

module.exports = router;
