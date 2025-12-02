const fetch = require('node-fetch');
const ORS_BASE_URL = 'https://api.openrouteservice.org';

async function geocodeAddress(apiKey, address) {
  const url = new URL(`${ORS_BASE_URL}/geocode/search`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('text', address);
  url.searchParams.set('size', '1');

  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Error en geocodificación ORS: ${resp.status}`);
  }

  const data = await resp.json();
  const feature = data.features && data.features[0];
  if (!feature || !feature.geometry || !Array.isArray(feature.geometry.coordinates)) {
    throw new Error('No se encontraron coordenadas para la dirección especificada');
  }

  const [lon, lat] = feature.geometry.coordinates;
  return { lon, lat };
}

async function getDistanceKm({ origin, destination }) {
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    throw new Error('ORS_API_KEY no está configurada');
  }

  // Geocodificar origen y destino
  const [orig, dest] = await Promise.all([
    geocodeAddress(apiKey, origin),
    geocodeAddress(apiKey, destination)
  ]);

  const url = `${ORS_BASE_URL}/v2/directions/driving-car`;
  const body = {
    coordinates: [
      [orig.lon, orig.lat],
      [dest.lon, dest.lat]
    ]
  };

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    throw new Error(`Error en ORS directions: ${resp.status}`);
  }

  const data = await resp.json();
  const feature = data.features && data.features[0];
  const summary = feature && feature.properties && feature.properties.summary;

  if (!summary || typeof summary.distance !== 'number') {
    throw new Error('No se pudo obtener distancia válida desde ORS');
  }

  const km = summary.distance / 1000; // ORS entrega distancia en metros
  return Math.round(km * 10) / 10;
}

module.exports = { getDistanceKm };
