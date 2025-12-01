const BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

async function getDistanceKm({ origin, destination }) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_MAPS_API_KEY no está configurada');
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('origins', origin);
  url.searchParams.set('destinations', destination);
  url.searchParams.set('mode', 'driving');
  url.searchParams.set('units', 'metric');
  url.searchParams.set('key', apiKey);

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Error en Google Distance Matrix: ${resp.status}`);
  }

  const data = await resp.json();
  const element = data.rows && data.rows[0] && data.rows[0].elements && data.rows[0].elements[0];

  if (!element || element.status !== 'OK' || !element.distance) {
    throw new Error('No se pudo obtener distancia válida');
  }

  const km = element.distance.value / 1000;
  return Math.round(km * 10) / 10;
}

module.exports = { getDistanceKm };
