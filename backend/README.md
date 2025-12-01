# Backend MedReserva (Node + Express + PostgreSQL)

Backend para la plataforma de reservas y logistica medica a domicilio.

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior

## Instalacion

```bash
cd backend
npm install
cp .env.example .env
# Editar .env y completar DATABASE_URL, PORT, CORS_ORIGIN, etc.
psql -d medreserva -f migrations/schema.sql
npm start
```

El servidor quedara escuchando en `http://localhost:3001` (o el puerto definido en `PORT`).

## Variables de entorno

- `DATABASE_URL`: cadena de conexion a PostgreSQL.
- `PORT`: puerto HTTP del servidor Express.
- `SENDGRID_API_KEY`: (opcional) API key para envio de correos.
- `GOOGLE_MAPS_API_KEY`: (opcional) API key para calculo de distancia.
- `CORS_ORIGIN`: lista de origenes permitidos (separados por coma).
- `JWT_SECRET`: secreto usado para firmar los JWT (access y refresh tokens).
- `JWT_EXPIRES_IN`: duracion del access token (ejemplo: `15m`).
- `JWT_REFRESH_EXPIRES_IN`: duracion del refresh token (ejemplo: `7d`).
- `NODE_ENV`: `development` o `production`. Se usa, por ejemplo, para marcar las cookies como `secure` en produccion.

## Endpoints

### `GET /health`

Devuelve un estado simple del servidor (ok, timestamp).

### `GET /api/examenes`

Lista los examenes disponibles desde la tabla `examenes`.

- Si la tabla esta vacia o la base de datos no esta disponible, responde con 3 examenes de ejemplo para no bloquear el frontend.

### `POST /api/reservas`

Crea una reserva.

- Calcula el recargo con la formula:

  ```texto
  recargo = km x 500 x num_viajes
  ```

- Calcula el total:

  ```texto
  total = precio_base + recargo
  ```

- Guarda la reserva en la tabla `reservas` si la base de datos esta configurada.

Body esperado (ejemplo):

```json
{
  "examen_id": 1,
  "nombre": "Paciente Ejemplo",
  "telefono": "+56 9 ...",
  "direccion": "Calle 123, Comuna",
  "comuna": "Comuna",
  "fecha": "2025-01-01",
  "hora": "09:00",
  "km": 10,
  "num_viajes": 1,
  "notas": "Observaciones opcionales"
}
```

Respuesta (ejemplo):

```json
{
  "id": 1,
  "total": 35000,
  "precio_base": 30000,
  "recargo": 5000,
  "km": 10,
  "num_viajes": 1
}
```

### `POST /api/pagos/verificar`

Pensado como endpoint de webhook de la pasarela de pago.

- Guarda el payload en la tabla `pagos`.
- Es responsabilidad del integrador agregar validacion de firma y manejo de idempotencia segun el proveedor (Transbank, MercadoPago, etc.).

### `GET /api/distancia?direccion=...`

Calcula la distancia en kilometros usando Google Distance Matrix.

- Usa `BASE_ADDRESS` (si existe) o `"Santiago, Chile"` como origen.
- Requiere `GOOGLE_MAPS_API_KEY` valida.

Ejemplo:

```bash
curl "http://localhost:3001/api/distancia?direccion=Calle+123,+Santiago"
```

## Esquema de base de datos

Definido en `migrations/schema.sql`:

- `examenes`: catalogo de examenes.
- `reservas`: reservas con costo total y estado.
- `pagos`: registros de pagos / webhooks.

## Notas de seguridad

- No exponer nunca `DATABASE_URL`, `SENDGRID_API_KEY` ni `GOOGLE_MAPS_API_KEY` en el frontend.
- Usar variables de entorno del proveedor de hosting para las claves.
- Para webhooks de pago, agregar validacion de firma y manejo de idempotencia antes de marcar una reserva como pagada.
