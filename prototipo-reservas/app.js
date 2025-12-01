// app.js - prototipo de cliente
(function(){
  const examenEl = document.getElementById('examen');
  const kmEl = document.getElementById('km');
  const viajesEl = document.getElementById('viajes');
  const precioBaseEl = document.getElementById('precioBase');
  const recargoEl = document.getElementById('recargo');
  const totalEl = document.getElementById('total');
  const mensajeEl = document.getElementById('mensaje');

  const btnCalcular = document.getElementById('btn-calcular');
  const btnEnviar = document.getElementById('btn-enviar');

  function parseExamen() {
    try { return JSON.parse(examenEl.value); }
    catch(e){ return {precio:0, viajes:1}; }
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

  btnCalcular.addEventListener('click', () => {
    const res = calcular();
    mensajeEl.textContent = `Total estimado ${formatCLP(res.total)}. Presiona "Enviar reserva" para guardarla.`;
  });

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
    const ENDPOINT = '/api/reservas'; // en producción reemplazar por /api/reservas en el dominio de la función
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
      const payload = {
        examen: document.querySelector('#examen').selectedOptions[0].text,
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        nombre: document.getElementById('nombre').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        km: resCalc.km,
        viajes: resCalc.viajes,
        precioBase: resCalc.precioBase,
        recargo: resCalc.recargo,
        total: resCalc.total,
        creadoEn: new Date().toISOString()
      };

      // Opción 1: enviar a backend (recomendado cuando exista)
      // await enviarABackend(payload);

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

      // temporal: guardarlo localmente como prueba
      localStorage.setItem('ultimaReserva', JSON.stringify(payload));
      mensajeEl.innerHTML = '<span class="success">Reserva guardada en demo (local). Implementar backend o Google Form para persistencia real.</span>';
    } catch (err) {
      console.error(err);
      mensajeEl.innerHTML = '<span class="error">Error: '+ (err.message || err) +'</span>';
    }
  });

  // calcular onload
  calcular();
})();
