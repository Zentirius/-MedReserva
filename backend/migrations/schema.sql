CREATE TABLE IF NOT EXISTS examenes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio_base INTEGER NOT NULL,
  viajes_requeridos INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  examen_id INTEGER NOT NULL REFERENCES examenes(id),
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT NOT NULL,
  comuna TEXT,
  fecha_hora TIMESTAMPTZ NOT NULL,
  km NUMERIC(10,2),
  num_viajes INTEGER,
  precio_base INTEGER NOT NULL,
  recargo INTEGER NOT NULL,
  total INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagos (
  id SERIAL PRIMARY KEY,
  reserva_id INTEGER REFERENCES reservas(id),
  proveedor TEXT,
  referencia TEXT,
  monto INTEGER,
  moneda TEXT,
  estado TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
