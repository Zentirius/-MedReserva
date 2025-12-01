const express = require('express');
const db = require('../db');

const router = express.Router();

function calcularRecargo(km, viajes) {
  const kmNumber = typeof km === 'number' ? km : parseFloat(km) || 0;
  const viajesNumber = viajes || 1;
  return Math.round(kmNumber * 500 * viajesNumber);
}

router.post('/', async (req, res) => {
  const {
    examen_id,
    nombre,
    telefono,
    direccion,
    comuna,
    fecha,
    hora,
    km,
    num_viajes,
    notas
  } = req.body || {};

  if (!examen_id || !nombre || !telefono || !direccion || !fecha) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const fechaHoraIso = hora ? `${fecha}T${hora}` : `${fecha}T09:00:00`;

  try {
    let exam;
    try {
      const result = await db.query(
        'SELECT id, nombre, precio_base, viajes_requeridos FROM examenes WHERE id = $1',
        [examen_id]
      );
      exam = result.rows[0];
    } catch (errDb) {
      console.error('Error consultando examen:', errDb.message);
    }

    if (!exam) {
      exam = { id: examen_id, nombre: 'Examen', precio_base: 30000, viajes_requeridos: 1 };
    }

    const viajes = num_viajes || exam.viajes_requeridos || 1;
    const recargo = calcularRecargo(km, viajes);
    const total = exam.precio_base + recargo;

    let reservaId = null;
    try {
      const insertResult = await db.query(
        'INSERT INTO reservas (examen_id, nombre, telefono, direccion, comuna, fecha_hora, km, num_viajes, precio_base, recargo, total, notas) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id',
        [
          exam.id,
          nombre,
          telefono,
          direccion,
          comuna || null,
          new Date(fechaHoraIso),
          km != null ? parseFloat(km) : null,
          viajes,
          exam.precio_base,
          recargo,
          total,
          notas || null
        ]
      );
      reservaId = insertResult.rows[0]?.id;
    } catch (errInsert) {
      console.error('Error insertando reserva en base de datos:', errInsert.message);
    }

    res.status(201).json({
      id: reservaId,
      total,
      precio_base: exam.precio_base,
      recargo,
      km: km != null ? parseFloat(km) || 0 : 0,
      num_viajes: viajes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});

module.exports = router;
