CREATE TABLE IF NOT EXISTS examenes (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT,
  precio_base INTEGER NOT NULL,
  duracion_min INTEGER,
  viajes_requeridos INTEGER NOT NULL DEFAULT 1,
  tipo_atencion TEXT DEFAULT 'domicilio', -- domicilio | centro | mixto
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

-- Datos iniciales de examenes/servicios inspirados en la página de reservas de MovilSalud (Setmore).
-- Los precios_base son valores de referencia y deben ser ajustados según la tarifa real.
INSERT INTO examenes (slug, nombre, descripcion, categoria, precio_base, duracion_min, viajes_requeridos, tipo_atencion, activo)
VALUES
  ('eeg_prolongado_1_2h', 'EEG PROLONGADO 1-2 HORAS', NULL, 'Neurofisiología', 0, 120, 1, 'domicilio', TRUE),
  ('eeg_prolongado_3_4h', 'EEG PROLONGADO 3-4 HORAS', NULL, 'Neurofisiología', 0, 240, 1, 'domicilio', TRUE),
  ('eeg_prolongado_5_6h', 'EEG PROLONGADO 5-6 HORAS', NULL, 'Neurofisiología', 0, 360, 1, 'domicilio', TRUE),
  ('eeg_video_12h', 'EEG VIDEO ASISTIDO HASTA 12 HORAS', NULL, 'Neurofisiología', 0, 720, 1, 'domicilio', TRUE),
  ('eeg_privacion_sueno', 'EEG CON PRIVACION PARCIAL O TOTAL DE SUEÑO', NULL, 'Neurofisiología', 0, 180, 1, 'domicilio', TRUE),

  ('polisomnografia_basal', 'POLISOMNOGRAFIA BASAL', NULL, 'Sueño', 0, 480, 1, 'domicilio', TRUE),
  ('polisomnografia_noche_dividida', 'POLISOMNOGRAFIA NOCHE DIVIDIDA O CON TITULACION', NULL, 'Sueño', 0, 480, 1, 'domicilio', TRUE),
  ('poligrafia_respiratoria', 'POLIGRAFIA RESPIRATORIA', NULL, 'Sueño', 0, 480, 1, 'domicilio', TRUE),
  ('saturometria_continua_nocturna', 'Saturometría continua nocturna', NULL, 'Respiratorio', 0, 480, 1, 'domicilio', TRUE),

  ('espirometria_basal_broncodilatador', 'Espirometria basal y/ con broncodilatador. Niños y Adultos', NULL, 'Respiratorio', 0, 60, 1, 'domicilio', TRUE),

  ('ecotomografia_doppler_color', 'ECOTOMOGRAFIA DOPPLER COLOR', NULL, 'Imagenología', 0, 60, 1, 'domicilio', TRUE),
  ('ecotomografia_general', 'ECOTOMOGRAFIA DE TODO TIPO', NULL, 'Imagenología', 0, 45, 1, 'domicilio', TRUE),
  ('radiografia_digital_movil', 'RADIOGRAFIA DIGITAL DIRECTA, MOVIL', NULL, 'Imagenología', 0, 45, 1, 'domicilio', TRUE),
  ('radiologia_domicilio', 'Radiología en domicilio', NULL, 'Imagenología', 0, 60, 1, 'domicilio', TRUE),

  ('holter_ecg_ritmo', 'HOLTER DE ECG, O LLAMADO DE RITMO', NULL, 'Cardiología', 0, 1440, 1, 'domicilio', TRUE),
  ('ecg_reposo', 'Electrocardiograma de reposo', NULL, 'Cardiología', 0, 30, 1, 'domicilio', TRUE),
  ('holter_ecg_24h', 'Electrocardiografía continua 24 hrs. (Holter)', NULL, 'Cardiología', 0, 1440, 1, 'domicilio', TRUE),
  ('holter_presion_arterial', 'Monitoreo ambulatorio de Presión Arterial (Holter de PA)', NULL, 'Cardiología', 0, 1440, 1, 'domicilio', TRUE),

  ('poligrafia_titulacion', 'Poligrafía con titulación', NULL, 'Sueño', 0, 480, 1, 'domicilio', TRUE),
  ('poligrafia_diagnostico', 'Poligrafía Respiratoria o de diagnóstico', NULL, 'Sueño', 0, 480, 1, 'domicilio', TRUE),

  ('nebulizador_venta', 'Venta Nebulizadores (incluye despacho Santiago)', 'Recargo $3000 zonas fuera de Las Condes, Vitacura, Providencia, La Reina, Ñuñoa, Macul', 'Productos', 0, 0, 1, 'despacho', TRUE),
  ('aerocamara_lactante', 'Aerocámara Lactante', NULL, 'Productos', 0, 0, 1, 'despacho', TRUE),
  ('aerocamara_escolar', 'Aerocámara Escolar', NULL, 'Productos', 0, 0, 1, 'despacho', TRUE),
  ('aerocamara_preescolar', 'Aerocámara Pre-escolar con silbido indicador', NULL, 'Productos', 0, 0, 1, 'despacho', TRUE),
  ('aerocamara_adultos', 'Aerocámara Adolescentes y Adultos 175ml', NULL, 'Productos', 0, 0, 1, 'despacho', TRUE)
ON CONFLICT (slug) DO NOTHING;
