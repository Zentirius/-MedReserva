// app.js - prototipo de cliente
(function(){
  const API_BASE = (window.__API_BASE__ && window.__API_BASE__) || 'http://localhost:3001';
  const examenEl = document.getElementById('examen');
  const kmEl = document.getElementById('km');
  const viajesEl = document.getElementById('viajes');
  const precioBaseEl = document.getElementById('precioBase');
  const recargoEl = document.getElementById('recargo');
  const totalEl = document.getElementById('total');
  const mensajeEl = document.getElementById('mensaje');

  const btnCalcular = document.getElementById('btn-calcular');
  const btnEnviar = document.getElementById('btn-enviar');
  const btnObtenerKm = document.getElementById('btn-obtener-km');

  function parseExamen() {
    const opt = examenEl && examenEl.selectedOptions && examenEl.selectedOptions[0];
    if (!opt) return { id: null, precio: 0, viajes: 1 };
    const precio = Number(opt.dataset && opt.dataset.precio ? opt.dataset.precio : 0);
    const viajes = Number(opt.dataset && opt.dataset.viajes ? opt.dataset.viajes : 1);
    return { id: opt.value || null, precio, viajes };
  }

  function formatCLP(n){
    return n === null || n===undefined ? '$0' : n.toLocaleString('es-CL', {style:'currency',currency:'CLP'});
  }

  function calcular(){
    const exam = parseExamen();
    const km = Math.max(0, parseFloat(kmEl.value) || 0);
    // si el campo viajes local difiere, preferir input viajes
    const viajesInput = Math.max(1, parseInt(viajesEl.value) || exam.viajes || 1);
    const precioBase = Number(exam.precio || 0);
    const recargo = Math.round(km * 500 * viajesInput);
    const total = precioBase + recargo;
    // actualizar UI
    precioBaseEl.textContent = formatCLP(precioBase);
    recargoEl.textContent = formatCLP(recargo);
    totalEl.textContent = formatCLP(total);
    return {precioBase, recargo, total, km, viajes: viajesInput};
  }

  async function cargarExamenes(){
    try {
      const resp = await fetch(`${API_BASE}/api/examenes`);
      if (!resp.ok) throw new Error('No se pudieron cargar los exámenes desde el backend');
      const lista = await resp.json();
      if (!Array.isArray(lista) || lista.length === 0) throw new Error('Lista de exámenes vacía');
      examenEl.innerHTML = lista.map(e => `
        <option value="${e.id}" data-precio="${e.precio_base}" data-viajes="${e.viajes_requeridos}">
          ${e.nombre}
        </option>
      `).join('');
      calcular();
    } catch (err) {
      console.error(err);
      // fallback local
      const local = [
        { id: '1', nombre: 'Examen A', precio_base: 30000, viajes_requeridos: 1 },
        { id: '2', nombre: 'Examen B', precio_base: 45000, viajes_requeridos: 2 },
        { id: '3', nombre: 'Examen C', precio_base: 70000, viajes_requeridos: 4 }
      ];
      examenEl.innerHTML = local.map(e => `
        <option value="${e.id}" data-precio="${e.precio_base}" data-viajes="${e.viajes_requeridos}">
          ${e.nombre}
        </option>
      `).join('');
      mensajeEl.textContent = 'Usando lista local de exámenes. Configurar backend para datos reales.';
      calcular();
    }
  }

  async function obtenerKmDesdeBackend() {
    const direccion = document.getElementById('direccion').value.trim();
    if (!direccion) {
      mensajeEl.textContent = 'Ingresa una dirección antes de calcular la distancia.';
      return;
    }

    mensajeEl.textContent = 'Calculando distancia...';
    try {
      const resp = await fetch(`${API_BASE}/api/distancia?direccion=${encodeURIComponent(direccion)}`);
      if (!resp.ok) {
        throw new Error('No se pudo obtener la distancia (verificar backend)');
      }
      const data = await resp.json();
      if (typeof data.km !== 'number') {
        throw new Error('Respuesta de distancia inválida');
      }
      kmEl.value = data.km;
      const res = calcular();
      mensajeEl.textContent = `Distancia aproximada: ${data.km.toFixed(1)} km. Total estimado ${formatCLP(res.total)}.`;
    } catch (err) {
      console.error(err);
      mensajeEl.textContent = `Error al calcular distancia: ${err.message || err}`;
    }
  }

  btnCalcular.addEventListener('click', () => {
    const res = calcular();
    mensajeEl.textContent = `Total estimado ${formatCLP(res.total)}. Presiona "Enviar reserva" para guardarla.`;
  });

  if (btnObtenerKm) {
    btnObtenerKm.addEventListener('click', () => {
      obtenerKmDesdeBackend();
    });
  }

  // Envío a Google Forms: por simplicidad dejamos placeholders
  // 1) Crea un Google Form con los campos y copia el "form action" y "entry.xxxxx" para cada campo.
  // 2) Reemplaza GOOGLE_FORM_ACTION y los nombres en payload below.
  async function enviarAGoogleForms(formDataPayload) {
    const GOOGLE_FORM_ACTION = 'REEMPLAZAR_CON_GOOGLE_FORM_ACTION_URL';
    if (GOOGLE_FORM_ACTION.includes('REEMPLAZAR')) {
      throw new Error('Debes configurar la URL del Google Form en app.js antes de usar envío directo.');
    }
    const form = new URLSearchParams(formDataPayload);
    const resp = await fetch(GOOGLE_FORM_ACTION, {
      method: 'POST',
      body: form,
      mode: 'no-cors'
    });
    return resp;
  }

  // Envío a backend (recomendado): apunta a un endpoint tuyo que procese y guarde en Airtable/Supabase.
  async function enviarABackend(jsonPayload) {
    const ENDPOINT = `${API_BASE}/api/reservas`;
    const resp = await fetch(ENDPOINT, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(jsonPayload)
    });
    if (!resp.ok) throw new Error('Error al enviar a backend: ' + resp.status);
    return resp.json();
  }

  btnEnviar.addEventListener('click', async () => {
    mensajeEl.textContent = 'Procesando...';
    try {
      const resCalc = calcular();
      const examParsed = parseExamen();
      const payload = {
        examen_id: examParsed.id,
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        comuna: '',
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        km: resCalc.km,
        num_viajes: resCalc.viajes,
        notas: ''
      };

      // Enviar a backend (recomendado)
      const respuestaBackend = await enviarABackend(payload);

      // Guardar también la última reserva localmente como respaldo
      const resumenLocal = {
        ...payload,
        backend_id: respuestaBackend && respuestaBackend.id,
        total_calculado: respuestaBackend && typeof respuestaBackend.total === 'number'
          ? respuestaBackend.total
          : resCalc.total,
        creadoEn: new Date().toISOString()
      };

      localStorage.setItem('ultimaReserva', JSON.stringify(resumenLocal));
      mensajeEl.innerHTML = `<span class="success">Reserva enviada. ID: ${respuestaBackend && respuestaBackend.id ? respuestaBackend.id : 'pendiente'}. Total estimado: ${formatCLP(resumenLocal.total_calculado)}.</span>`;

      // Opción 2: enviar a Google Forms (descomentar cuando tengas action)
      // const formPayload = {
      //   'entry.123456': payload.nombre,
      //   'entry.234567': payload.telefono,
      //   'entry.345678': payload.direccion,
      //   'entry.456789': payload.examen,
      //   'entry.567890': payload.fecha + ' ' + payload.hora,
      //   'entry.678901': payload.total
      // };
      // await enviarAGoogleForms(formPayload);

      // si falla el backend, intentamos guardar al menos en localStorage
      const fallback = {
        error: true,
        mensaje: err.message || String(err),
        payloadUltimoIntento: {
          ...payload,
          creadoEn: new Date().toISOString()
        }
      };
      localStorage.setItem('ultimaReservaError', JSON.stringify(fallback));
      mensajeEl.innerHTML = '<span class="error">Error al enviar la reserva. Se ha guardado un respaldo local; contactar al equipo para confirmar.</span>';
    } catch (err) {
      console.error(err);
      mensajeEl.innerHTML = '<span class="error">Error: '+ (err.message || err) +'</span>';
    }
  });

  // cargar exámenes y calcular onload
  cargarExamenes();
})();
