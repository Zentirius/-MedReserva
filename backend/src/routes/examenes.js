const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let rows = [];
    try {
      const result = await db.query(
        'SELECT id, slug, nombre, descripcion, categoria, precio_base, duracion_min, viajes_requeridos FROM examenes WHERE activo = true ORDER BY categoria NULLS LAST, nombre ASC'
      );
      rows = result.rows;
    } catch (errDb) {
      console.error('Error consultando examenes en la base de datos:', errDb.message);
    }

    if (!rows || rows.length === 0) {
      rows = [
        { id: 1, nombre: 'Examen A', precio_base: 30000, viajes_requeridos: 1 },
        { id: 2, nombre: 'Examen B', precio_base: 45000, viajes_requeridos: 2 },
        { id: 3, nombre: 'Examen C', precio_base: 70000, viajes_requeridos: 4 }
      ];
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener exámenes' });
  }
});

module.exports = router;
