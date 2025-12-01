# MedReserva - Plataforma de reservas medicas a domicilio

Este repositorio contiene el frontend de prototipo y el backend Express para gestionar reservas de examenes a domicilio.

## Contexto e independencia de Setmore

MedReserva es una **solucion propia** de reservas y logistica medica a domicilio.

Setmore (por ejemplo `https://movilsalud.setmore.com/`) se usa solo como **referencia** para entender:

- Que tipos de examenes ofrece hoy el cliente.
- Como es el flujo actual de agendamiento.

Nada de la logica de Setmore se integra directamente en este proyecto:

- No se llama a la API de Setmore desde el frontend ni desde el backend.
- No se usan widgets de Setmore dentro de MedReserva.

El objetivo es tener:

- Backend propio con examenes (Express + PostgreSQL).
- Calculo de distancia y recargo por zona usando Google Maps Distance Matrix desde el backend.
- Tabla de reservas y, mas adelante, integracion de pagos.

## Estructura del proyecto

- `index.html` (raiz): redirige al prototipo de reservas.
- `prototipo-reservas/`: prototipo frontend HTML/CSS/JS.
- `backend/`: API REST en Node + Express + PostgreSQL.

### 1. Frontend - `prototipo-reservas/`

#### Archivos principales

- `index.html`: pagina con el formulario de reserva.
- `styles.css`: estilos basicos (layout, tipografia, botones, card).
- `app.js`: logica de calculo de precio, recargo por zona y envio de datos.
- `assets/`: carpeta para imagenes (logo, ilustraciones, etc.).

#### Como probar el prototipo

1. Abrir `prototipo-reservas/index.html` directamente en el navegador **o** servir la carpeta con un servidor estatico (por ejemplo `npx http-server prototipo-reservas`).
2. Flujo esperado:
   - Seleccionar examen.
   - Ingresar fecha, hora, nombre, telefono, direccion y distancia aprox. en km.
   - Ver el total estimado (precio base + recargo por zona).
   - Presionar **Enviar reserva** (por defecto guarda la ultima reserva en `localStorage`).

#### Integracion del formulario

Hay dos caminos posibles:

- **Google Forms (sin backend):**
  - Crear un formulario en Google Forms.
  - Tomar la URL de `form action` y los IDs `entry.xxxxx`.
  - Sustituir los placeholders en `enviarAGoogleForms` dentro de `app.js`.

- **Backend Express (recomendado):**
  - Usar la funcion `enviarABackend` de `app.js` apuntando a `/api/reservas` del backend.
  - El backend calcula el recargo y persiste la reserva en la base de datos.

### 2. Backend - `backend/`

Backend en Node 18+, Express y PostgreSQL 14+.

#### Requisitos

- Node.js 18 o superior.
- PostgreSQL 14 o superior.

#### Instalacion rapida

```bash
cd backend
npm install
cp .env.example .env
# Editar .env y completar DATABASE_URL, PORT, CORS_ORIGIN, etc.
psql -d medreserva -f migrations/schema.sql
npm start
```

Por defecto el servidor escucha en `http://localhost:3001`.

#### Endpoints principales

- `GET /health`  
  Estado simple del servidor.

- `GET /api/examenes`  
  Lista de examenes. Si la tabla esta vacia o la base de datos no esta disponible, devuelve 3 examenes de ejemplo.

- `POST /api/reservas`  
  Crea una reserva y calcula el recargo:

  ```texto
  recargo = km x 500 x num_viajes
  total   = precio_base + recargo
  ```

  Guarda los datos en la tabla `reservas` cuando la base esta configurada.

- `POST /api/pagos/verificar`  
  Pensado para recibir webhooks de la pasarela de pago. Guarda el payload en la tabla `pagos`.

- `GET /api/distancia?direccion=...`  
  Calcula la distancia (km) usando Google Distance Matrix (requiere `GOOGLE_MAPS_API_KEY`).

### 2.1. Configuracion de Google Maps

El backend usa `GOOGLE_MAPS_API_KEY` para consultar la API de Distance Matrix de Google y asi calcular la distancia entre una direccion base (`BASE_ADDRESS`) y la direccion del paciente.

Recomendaciones:

- Definir `GOOGLE_MAPS_API_KEY` y `BASE_ADDRESS` en el `.env` del backend o en las variables de entorno del proveedor de hosting.
- Restringir siempre la key por dominio/IP y por APIs permitidas.

Ejemplo en `.env`:

```env
GOOGLE_MAPS_API_KEY=tu_key_de_google
BASE_ADDRESS="Clinica Ejemplo, Santiago, Chile"
```

### 3. Arquitectura

```texto
Frontend (HTML/CSS/JS)
        |
        | fetch()
        v
Backend Express (Node)
        |
        | pg Pool
        v
Base de datos (PostgreSQL)
```

La logica de negocio sensible (calculo de costo por zona, uso de API keys, integracion con pasarela de pago) debe ir en el backend, no en el frontend.

### 4. Seguridad

- No exponer claves ni tokens en `index.html` ni en `app.js`.
- Guardar claves en variables de entorno (`.env`) o en el panel del proveedor (Vercel, Render, Railway, etc.).
- Si alguna key estuvo en un repositorio publico, revocarla y regenerarla.

### 5. Configuracion de API_BASE en produccion

El frontend del prototipo se comunica con el backend a traves de la variable global `window.__API_BASE__`.

En `prototipo-reservas/index.html` se declara:

```html
<script>
  // En produccion, reemplazar esta URL por la del backend desplegado
  // por ejemplo: 'https://api.medreserva.cl'
  window.__API_BASE__ = 'REEMPLAZAR_CON_URL_BACKEND';
  </script>
```

En local, si `window.__API_BASE__` no esta definido, el frontend usa por defecto `http://localhost:3001`.

En produccion, basta con editar ese valor para apuntar al dominio real del backend (por ejemplo, Railway/Render/Fly.io). De esta forma se evita usar `localhost` en Vercel y el prototipo puede consumir `/api/examenes`, `/api/distancia` y `/api/reservas` desde el servidor correcto.
