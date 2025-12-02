// app.js - MedReserva Cliente
(function() {
  'use strict';

  // ===== Configuración =====
  const API_BASE = window.__API_BASE__ || 'http://localhost:3001';

  // ===== Elementos del DOM =====
  const examenEl = document.getElementById('examen');
  const kmEl = document.getElementById('km');
  const viajesEl = document.getElementById('viajes');
  const precioBaseEl = document.getElementById('precioBase');
  const recargoEl = document.getElementById('recargo');
  const totalEl = document.getElementById('total');
  const mensajeEl = document.getElementById('mensaje');
  const formEl = document.getElementById('reserva-form');
  const btnCalcular = document.getElementById('btn-calcular');
  const btnObtenerKm = document.getElementById('btn-obtener-km');

  // ===== Mapa (Leaflet) =====
  let map = null;
  let markerOrigin = null;
  let markerDest = null;

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || map) return;

    map = L.map('map').setView([-33.45, -70.65], 11); // Santiago aproximado

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  }

  function updateMap(originCoords, destCoords) {
    if (!map) return;

    // Limpiar marcadores previos
    if (markerOrigin) {
      map.removeLayer(markerOrigin);
      markerOrigin = null;
    }
    if (markerDest) {
      map.removeLayer(markerDest);
      markerDest = null;
    }

    const points = [];

    if (originCoords && typeof originCoords.lat === 'number' && typeof originCoords.lon === 'number') {
      markerOrigin = L.marker([originCoords.lat, originCoords.lon]).addTo(map);
      markerOrigin.bindPopup('Base MovilSalud');
      points.push([originCoords.lat, originCoords.lon]);
    }

    if (destCoords && typeof destCoords.lat === 'number' && typeof destCoords.lon === 'number') {
      markerDest = L.marker([destCoords.lat, destCoords.lon]).addTo(map);
      markerDest.bindPopup('Dirección del paciente');
      points.push([destCoords.lat, destCoords.lon]);
    }

    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length === 2) {
      const bounds = L.latLngBounds(points[0], points[1]);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  // ===== Utilidades =====
  function formatCLP(n, showConsultar = false) {
    if (n === null || n === undefined || (showConsultar && n === 0)) return 'Consultar';
    if (n === 0) return '$0';
    return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP' });
  }

  function mostrarMensaje(texto, tipo = 'info') {
    if (!mensajeEl) return;
    const clases = { success: 'success', error: 'error', info: 'loading' };
    mensajeEl.innerHTML = `<span class="${clases[tipo] || ''}">${texto}</span>`;
  }

  function limpiarMensaje() {
    if (mensajeEl) mensajeEl.innerHTML = '';
  }

  // ===== Lógica de exámenes =====
  function parseExamen() {
    const opt = examenEl?.selectedOptions?.[0];
    if (!opt || !opt.value) return { id: null, precio: 0, viajes: 1 };
    return {
      id: opt.value,
      precio: Number(opt.dataset?.precio) || 0,
      viajes: Number(opt.dataset?.viajes) || 1
    };
  }

  function calcular() {
    const exam = parseExamen();
    const km = Math.max(0, parseFloat(kmEl?.value) || 0);
    const viajes = exam.viajes || 1;
    const precioBase = exam.precio || 0;
    const recargo = Math.round(km * 500 * viajes);
    const total = precioBase + recargo;

    // Actualizar campo de viajes (readonly)
    if (viajesEl) viajesEl.value = viajes;

    // Actualizar UI de resumen
    if (precioBaseEl) precioBaseEl.textContent = precioBase === 0 ? 'Consultar' : formatCLP(precioBase);
    if (recargoEl) recargoEl.textContent = formatCLP(recargo);
    if (totalEl) totalEl.textContent = precioBase === 0 ? 'Consultar + recargo' : formatCLP(total);

    return { precioBase, recargo, total, km, viajes };
  }

  async function cargarExamenes() {
    try {
      const resp = await fetch(`${API_BASE}/api/examenes`);
      if (!resp.ok) throw new Error('Error de conexión');
      
      const lista = await resp.json();
      if (!Array.isArray(lista) || lista.length === 0) {
        throw new Error('Sin exámenes');
      }

      examenEl.innerHTML = '<option value="">Seleccione un examen...</option>' +
        lista.map(e => `
          <option value="${e.id}" data-precio="${e.precio_base}" data-viajes="${e.viajes_requeridos}">
            ${e.nombre}${e.precio_base > 0 ? ' - ' + formatCLP(e.precio_base) : ''}
          </option>
        `).join('');

      calcular();
    } catch (err) {
      console.warn('Usando exámenes de respaldo:', err.message);
      
      const fallback = [
        { id: '1', nombre: 'EEG Prolongado 1-2 horas', precio_base: 0, viajes_requeridos: 1 },
        { id: '2', nombre: 'Polisomnografía Basal', precio_base: 0, viajes_requeridos: 1 },
        { id: '3', nombre: 'Holter ECG 24 hrs', precio_base: 0, viajes_requeridos: 1 },
        { id: '4', nombre: 'Electrocardiograma de reposo', precio_base: 0, viajes_requeridos: 1 },
        { id: '5', nombre: 'Ecotomografía General', precio_base: 0, viajes_requeridos: 1 },
        { id: '6', nombre: 'Espirometría basal', precio_base: 0, viajes_requeridos: 1 }
      ];

      examenEl.innerHTML = '<option value="">Seleccione un examen...</option>' +
        fallback.map(e => `
          <option value="${e.id}" data-precio="${e.precio_base}" data-viajes="${e.viajes_requeridos}">
            ${e.nombre}${e.precio_base > 0 ? ' - ' + formatCLP(e.precio_base) : ''}
          </option>
        `).join('');

      mostrarMensaje('⚠️ Modo demo: usando lista local de exámenes', 'info');
      calcular();
    }
  }

  // ===== Cálculo de distancia =====
  async function obtenerKmDesdeBackend() {
    const direccion = document.getElementById('direccion')?.value?.trim();
    if (!direccion) {
      mostrarMensaje('Ingrese una dirección para calcular la distancia', 'error');
      return;
    }

    mostrarMensaje('📍 Calculando distancia...', 'info');

    try {
      const resp = await fetch(`${API_BASE}/api/distancia?direccion=${encodeURIComponent(direccion)}`);
      if (!resp.ok) throw new Error('Servicio no disponible');

      const data = await resp.json();
      if (typeof data.km !== 'number') throw new Error('Respuesta inválida');

      kmEl.value = data.km.toFixed(1);
      const res = calcular();
      mostrarMensaje(`✓ Distancia: ${data.km.toFixed(1)} km · Total: ${formatCLP(res.total)}`, 'success');

      // Actualizar mapa si hay coordenadas
      const origin = data.origin || {};
      const dest = data.destination || {};
      updateMap(
        { lat: origin.lat, lon: origin.lon },
        { lat: dest.lat, lon: dest.lon }
      );
    } catch (err) {
      console.error('Error distancia:', err);
      mostrarMensaje('No se pudo calcular la distancia. Ingrese el valor manualmente.', 'error');
    }
  }

  // ===== Envío de reserva =====
  async function enviarReserva(payload) {
    const resp = await fetch(`${API_BASE}/api/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${resp.status}`);
    }
    return resp.json();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const exam = parseExamen();
    if (!exam.id) {
      mostrarMensaje('Seleccione un examen', 'error');
      return;
    }

    const nombre = document.getElementById('nombre')?.value?.trim();
    const telefono = document.getElementById('telefono')?.value?.trim();
    const direccion = document.getElementById('direccion')?.value?.trim();
    const fecha = document.getElementById('fecha')?.value;
    const hora = document.getElementById('hora')?.value;

    if (!nombre || !telefono || !direccion || !fecha || !hora) {
      mostrarMensaje('Complete todos los campos obligatorios', 'error');
      return;
    }

    mostrarMensaje('Enviando reserva...', 'info');

    const resCalc = calcular();
    const payload = {
      examen_id: exam.id,
      nombre,
      telefono,
      direccion,
      comuna: '',
      fecha,
      hora,
      km: resCalc.km,
      num_viajes: resCalc.viajes,
      notas: ''
    };

    try {
      const respuesta = await enviarReserva(payload);

      // Guardar respaldo local
      localStorage.setItem('ultimaReserva', JSON.stringify({
        ...payload,
        backend_id: respuesta?.id,
        total: respuesta?.total || resCalc.total,
        timestamp: new Date().toISOString()
      }));

      const idTexto = respuesta?.id ? `#${respuesta.id}` : '';
      const totalTexto = formatCLP(respuesta?.total || resCalc.total);
      
      mostrarMensaje(
        `✓ ¡Reserva confirmada! ${idTexto}<br>Total: ${totalTexto}<br>Le contactaremos para confirmar la cita.`,
        'success'
      );

      // Limpiar formulario
      formEl?.reset();
      calcular();

    } catch (err) {
      console.error('Error reserva:', err);
      
      // Guardar intento fallido
      localStorage.setItem('reservaFallida', JSON.stringify({
        payload,
        error: err.message,
        timestamp: new Date().toISOString()
      }));

      mostrarMensaje(
        `Error al enviar: ${err.message}. Intente nuevamente o contáctenos por WhatsApp.`,
        'error'
      );
    }
  }

  // ===== Event Listeners =====
  if (examenEl) {
    examenEl.addEventListener('change', calcular);
  }

  if (kmEl) {
    kmEl.addEventListener('input', calcular);
  }

  if (btnCalcular) {
    btnCalcular.addEventListener('click', () => {
      const res = calcular();
      mostrarMensaje(`Total estimado: ${formatCLP(res.total)}`, 'info');
    });
  }

  if (btnObtenerKm) {
    btnObtenerKm.addEventListener('click', obtenerKmDesdeBackend);
  }

  if (formEl) {
    formEl.addEventListener('submit', handleSubmit);
  }

  // ===== Inicialización =====
  if (typeof L !== 'undefined') {
    initMap();
  }
  cargarExamenes();

  // Setear fecha mínima como hoy
  const fechaInput = document.getElementById('fecha');
  if (fechaInput) {
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.setAttribute('min', hoy);
  }
})();
