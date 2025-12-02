-- Actualización de viajes_requeridos y correcciones de ortografía
-- Se ejecuta automáticamente al iniciar el servidor

-- Ajustar viajes_requeridos según criterio del cliente:
-- 4 viajes: Saturometría, Holter (presión, ritmo, 24h), Poligrafías
-- 2 viajes: todos los demás

-- 4 VIAJES (instalar + regreso + retirar + regreso)
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'saturometria_continua_nocturna';
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'holter_presion_arterial';
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'holter_ecg_ritmo';
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'holter_ecg_24h';
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'poligrafia_respiratoria';
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'poligrafia_titulacion';
UPDATE examenes SET viajes_requeridos = 4 WHERE slug = 'poligrafia_diagnostico';

-- 2 VIAJES (todos los demás exámenes a domicilio)
UPDATE examenes SET viajes_requeridos = 2 WHERE slug IN (
  'eeg_prolongado_1_2h',
  'eeg_prolongado_3_4h',
  'eeg_prolongado_5_6h',
  'eeg_video_12h',
  'eeg_privacion_sueno',
  'polisomnografia_basal',
  'polisomnografia_noche_dividida',
  'espirometria_basal_broncodilatador',
  'ecotomografia_doppler_color',
  'ecotomografia_general',
  'radiografia_digital_movil',
  'radiologia_domicilio',
  'ecg_reposo'
);

-- Correcciones de ortografía
UPDATE examenes SET nombre = 'Espirometría basal y/o con broncodilatador. Niños y Adultos' 
WHERE slug = 'espirometria_basal_broncodilatador';

UPDATE examenes SET nombre = 'Poligrafía Respiratoria' 
WHERE slug = 'poligrafia_respiratoria';

UPDATE examenes SET nombre = 'Polisomnografía Basal' 
WHERE slug = 'polisomnografia_basal';

UPDATE examenes SET nombre = 'Polisomnografía Noche Dividida o con Titulación' 
WHERE slug = 'polisomnografia_noche_dividida';

UPDATE examenes SET nombre = 'EEG con Privación Parcial o Total de Sueño' 
WHERE slug = 'eeg_privacion_sueno';

UPDATE examenes SET nombre = 'Ecotomografía Doppler Color' 
WHERE slug = 'ecotomografia_doppler_color';

UPDATE examenes SET nombre = 'Ecotomografía de Todo Tipo' 
WHERE slug = 'ecotomografia_general';

UPDATE examenes SET nombre = 'Radiografía Digital Directa, Móvil' 
WHERE slug = 'radiografia_digital_movil';

UPDATE examenes SET nombre = 'Holter de ECG o Llamado de Ritmo' 
WHERE slug = 'holter_ecg_ritmo';

UPDATE examenes SET nombre = 'Aerocámara Pre-escolar con Silbido Indicador de Flujo' 
WHERE slug = 'aerocamara_preescolar';

-- Actualizar precios reales de MovilSalud Setmore
-- Neurología
UPDATE examenes SET precio_base = 220000 WHERE slug = 'eeg_prolongado_1_2h';
UPDATE examenes SET precio_base = 320000 WHERE slug = 'eeg_prolongado_3_4h';
UPDATE examenes SET precio_base = 420000 WHERE slug = 'eeg_prolongado_5_6h';
UPDATE examenes SET precio_base = 598000 WHERE slug = 'eeg_video_12h';
UPDATE examenes SET precio_base = 220000 WHERE slug = 'eeg_privacion_sueno';
UPDATE examenes SET precio_base = 450000 WHERE slug = 'polisomnografia_basal';
UPDATE examenes SET precio_base = 498000 WHERE slug = 'polisomnografia_noche_dividida';

-- Imagenología
UPDATE examenes SET precio_base = 120000 WHERE slug = 'ecotomografia_doppler_color';
UPDATE examenes SET precio_base = 85000 WHERE slug = 'ecotomografia_general';
UPDATE examenes SET precio_base = 85000 WHERE slug = 'radiografia_digital_movil';
UPDATE examenes SET precio_base = 85000 WHERE slug = 'radiologia_domicilio';

-- Respiratorio
UPDATE examenes SET precio_base = 56000 WHERE slug = 'espirometria_basal_broncodilatador';
UPDATE examenes SET precio_base = 95000 WHERE slug = 'saturometria_continua_nocturna';
UPDATE examenes SET precio_base = 220000 WHERE slug = 'poligrafia_respiratoria';

-- Cardiología
UPDATE examenes SET precio_base = 98500 WHERE slug = 'holter_ecg_ritmo';
UPDATE examenes SET precio_base = 52000 WHERE slug = 'ecg_reposo';
UPDATE examenes SET precio_base = 98500 WHERE slug = 'holter_ecg_24h';
UPDATE examenes SET precio_base = 95000 WHERE slug = 'holter_presion_arterial';

-- Sueño
UPDATE examenes SET precio_base = 220000 WHERE slug = 'poligrafia_titulacion';
UPDATE examenes SET precio_base = 220000 WHERE slug = 'poligrafia_diagnostico';

-- Productos
UPDATE examenes SET precio_base = 56000 WHERE slug = 'nebulizador_venta';
UPDATE examenes SET precio_base = 48000 WHERE slug = 'aerocamara_lactante';
UPDATE examenes SET precio_base = 48000 WHERE slug = 'aerocamara_escolar';
UPDATE examenes SET precio_base = 48000 WHERE slug = 'aerocamara_preescolar';
UPDATE examenes SET precio_base = 48000 WHERE slug = 'aerocamara_adultos';
