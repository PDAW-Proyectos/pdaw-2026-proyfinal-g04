# Documentación del Backend — KCHIN

API REST del gestor de caja comercial **KCHIN**. Este documento describe todos los endpoints expuestos por `server.js`, qué datos espera recibir cada uno y qué devuelve.

- **URL base:** `http://localhost:3000`
- **Puerto:** variable de entorno `PORT` (por defecto `3000`)
- **Formato:** JSON (`Content-Type: application/json` en las peticiones con body)
- **Autenticación:** sesión con cookie (`express-session`, cookie `connect.sid`)
- **Persistencia:** archivos JSON en `data/`

---

## Índice

1. [Autenticación y sesión](#autenticación-y-sesión)
2. [Convenciones generales](#convenciones-generales)
3. [Errores](#errores)
4. [Módulo Auth](#módulo-auth)
5. [Módulo Usuarios](#módulo-usuarios)
6. [Módulo Productos](#módulo-productos)
7. [Módulo Insumos](#módulo-insumos)
8. [Módulo Ingresos / Ventas](#módulo-ingresos--ventas)
9. [Módulo Egresos / Compras](#módulo-egresos--compras)
10. [Módulo Caja](#módulo-caja)
11. [Módulo Cotización](#módulo-cotización)
12. [Módulo Categorías](#módulo-categorías)
13. [Módulo Configuración](#módulo-configuración)
14. [Rutas web (HTML)](#rutas-web-html)

---

## Autenticación y sesión

La autenticación se basa en **sesiones con cookie**:

1. `POST /api/auth/login` valida email y contraseña (hash `bcrypt`).
2. Se regenera la sesión y se guardan en ella `req.session.userId` y `req.session.role`.
3. El navegador recibe la cookie `connect.sid` (`httpOnly`, `sameSite: lax`, `secure` en producción).
4. Los middlewares `requireAuth` y `allowRoles(...)` protegen las rutas.

**Roles disponibles:** `admin`, `repositor`, `cajero`.

Regla de autorización: **el rol `admin` siempre tiene acceso**; para el resto se debe coincidir con el rol permitido.

| Situación | Respuesta |
| --- | --- |
| Sin sesión, petición API (`Accept: application/json`) | `401 { "error": "Es necesario iniciar sesión" }` |
| Sin sesión, petición HTML | Redirección a `/login.html` |
| Rol no permitido, petición API | `403 { "error": "Acceso denegado" }` |
| Rol no permitido, petición HTML | `403` con `public/accesoDenegado.html` |

La duración de la sesión se toma de `Configuracion.sessionExpiringTime` (por defecto 8 horas). Si vale `0`, la cookie dura lo que dure la sesión del navegador.

---

## Convenciones generales

### Paginación

Los endpoints de listado aceptan query params:

| Parámetro | Tipo | Default | Rango |
| --- | --- | --- | --- |
| `pagina` | entero | `1` | `>= 1` |
| `limite` | entero | `10` | `1..50` |

Toda respuesta paginada incluye:

```json
{
  "total": 25,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 3
}
```

> Si `pagina` o `limite` son inválidos, se lanza un `Error` genérico y el handler responde **500** (no 400).

### Filtros (método HTTP `QUERY`)

Las rutas de filtrado están registradas con el método HTTP **`QUERY`** (`router.query(...)`, disponible en Node/Express de este proyecto), **no** con `GET`.

- Ruta: mismo path que el listado (`/api/<recurso>/`)
- Body: objeto JSON con las propiedades a comparar por **igualdad exacta**

```http
QUERY /api/usuarios/
Content-Type: application/json

{ "rol": "cajero" }
```

Ejemplos de filtros soportados por la utilidad `coincidePropiedad`:

```json
{ "nombre": "Coca-Cola 2.25L" }
{ "articulos": [{ "id": 1 }] }
```

---

## Errores

Las respuestas de error usan el formato **Problem Details (RFC 7807)** con `Content-Type: application/problem+json`.

```json
{
  "title": "Solicitud incorrecta",
  "status": 400,
  "detail": "El monto debe ser mayor a cero",
  "instance": "/api/ingreso/venta",
  "requestId": null
}
```

| Código | Significado |
| --- | --- |
| `400` | Datos inválidos / regla de negocio incumplida (`BadRequestError`) |
| `401` | No autenticado o credenciales incorrectas |
| `403` | Sin permisos para el rol |
| `404` | Recurso inexistente o ruta desconocida |
| `409` | Conflicto (por ejemplo, email ya registrado) |
| `500` | Error interno no controlado |
| `502` | Servicio externo no disponible (DolarAPI) |

Si el JSON enviado no puede parsearse, se responde `400` con `"El JSON enviado no es válido"`.
Cualquier ruta no registrada devuelve `404` con `"Ruta no encontrado"`.

---

## Módulo Auth

Base: `/api/auth`

### `POST /api/auth/login`

**Descripción:** Inicia sesión, valida credenciales y crea la sesión. Si se envía `requestedRole`, verifica que el usuario pertenezca a ese rol (salvo que sea `admin`, que puede ingresar a cualquier área).

**Autenticación:** Pública.

**Request:**

```json
{
  "email": "cajero@kchin.com",
  "password": "123456",
  "requestedRole": "cajero"
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `email` / `correo` | string | Sí | Se acepta cualquiera de los dos nombres |
| `password` / `contrasena` | string | Sí | Se acepta cualquiera de los dos nombres |
| `requestedRole` | string | No | `"admin"`, `"repositor"` o `"cajero"` |

**Response `200`:**

```json
{
  "idUsuario": 3,
  "nombre": "Juan",
  "email": "cajero@kchin.com",
  "rol": "cajero",
  "mensaje": "Inicio de sesión exitoso"
}
```

**Errores:** `401` credenciales incorrectas · `403` rol solicitado no coincide.

> Nota: actualmente no se valida el campo `habilitado` del usuario.

---

### `POST /api/auth/signup`

**Descripción:** Registra un usuario nuevo. Hashea la contraseña con `bcrypt` (12 rondas) y evita emails duplicados.

**Autenticación:** Requiere sesión con rol `admin`.

**Request:**

```json
{
  "nombre": "Ana",
  "apellido": "Lopez",
  "email": "ana@kchin.com",
  "password": "secreto123",
  "rol": "cajero"
}
```

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `nombre` | string | Sí |
| `apellido` | string | Sí |
| `email` | string | Sí |
| `password` | string | Sí |
| `rol` | `"admin"` \| `"repositor"` \| `"cajero"` | Sí |

**Response `201`:** usuario creado (incluye `id`, `habilitado` y el hash en `contraseña`).

```json
{
  "id": 5,
  "nombre": "Ana",
  "apellido": "Lopez",
  "email": "ana@kchin.com",
  "contraseña": "$2b$12$...",
  "rol": "cajero",
  "habilitado": true
}
```

**Errores:** `400` datos inválidos (email/contraseña vacíos) · `409` email ya en uso · `401`/`403` sin sesión o sin rol admin.

---

### `POST /api/auth/logout`

**Descripción:** Destruye la sesión y elimina la cookie `connect.sid`.

**Autenticación:** Pública (no exige sesión activa).

**Request:** sin body.

**Response `200`:**

```json
{ "mensaje": "Sesión cerrada correctamente" }
```

---

### `GET /api/auth/me`

**No implementado.** El router lo registra solo si `authController.me` existe; actualmente no existe, por lo que la ruta devuelve `404`.

---

## Módulo Usuarios

Base: `/api/usuarios`

> **Importante:** este router se monta **sin** `requireAuth`; todos sus endpoints son públicos en la implementación actual.

### `GET /api/usuarios/`

**Descripción:** Lista todos los usuarios de forma paginada.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "usuarios": [
    {
      "id": 1,
      "email": "admin@kchin.com",
      "contraseña": "$2b$10$...",
      "nombre": "Joaco",
      "apellido": "Yakete",
      "habilitado": true,
      "rol": "admin"
    }
  ],
  "total": 4,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

> La respuesta incluye el hash de la contraseña.

---

### `QUERY /api/usuarios/`

**Descripción:** Filtra usuarios por igualdad exacta de propiedades.

**Body:**

```json
{ "rol": "cajero" }
```

**Response `200`:** igual estructura que el listado (`usuarios`, `total`, `pagina`, `limite`, `totalPaginas`).

---

### `GET /api/usuarios/:id`

**Descripción:** Busca un usuario por su `id`.

**Response `200`:** objeto usuario.

**Errores:** `404` usuario no encontrado.

---

### `POST /api/usuarios/`

**Descripción:** Crea un usuario directamente en el repositorio. **No hashea la contraseña ni valida duplicados**; para alta segura usar `POST /api/auth/signup`.

**Request:**

```json
{
  "email": "nuevo@kchin.com",
  "contraseña": "texto-plano",
  "nombre": "Nuevo",
  "apellido": "Usuario",
  "rol": "cajero",
  "habilitado": true
}
```

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `email` | string | Sí |
| `contraseña` | string | Sí |
| `nombre` | string | Sí |
| `apellido` | string | Sí |
| `rol` | string | Sí |
| `habilitado` | boolean | No (default `true`) |

**Response `201`:** usuario creado con `id` asignado.

**Errores:** `400` email o contraseña vacíos.

---

### `PUT /api/usuarios/:id`

**Descripción:** Actualiza parcialmente un usuario (merge con los datos anteriores).

**Request:** cualquier subconjunto de campos del usuario.

**Response `200`:** usuario actualizado.

**Errores:** `404` usuario no encontrado.

---

### `DELETE /api/usuarios/:id`

**Descripción:** Elimina un usuario.

**Response `204`:** sin body.

**Errores:** `404` usuario no encontrado.

---

## Módulo Productos

Base: `/api/productos`

Tipos de producto (se determina por los campos enviados):

- **Producto por unidad:** tiene `unidad` (stock entero).
- **Producto por peso:** tiene `peso` y `unidadMedida` (`"g"`, `"kg"`, `"l"`, `"ml"`).

Los productos guardan `idCotizacion`, pero las respuestas de listado/búsqueda lo reemplazan por la cotización de venta actual.

### `GET /api/productos/`

**Descripción:** Lista productos paginados y agrega la cotización del dólar blue usada para el precio.

**Autenticación:** Pública.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Coca-Cola 2.25L",
      "categoria": "Bebidas",
      "descripcion": "Gaseosa Coca-Cola botella de 2.25 litros",
      "precioUsd": 2.5,
      "unidad": 10,
      "cotizacion": 1580,
      "cotizacionFecha": "2026-11-08T20:45:00.000Z"
    }
  ],
  "total": 10,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

---

### `QUERY /api/productos/`

**Descripción:** Filtra productos por propiedades exactas.

**Autenticación:** Pública.

**Body:**

```json
{ "categoria": "Bebidas" }
```

**Response `200`:** `{ "productos": [...], "total", "pagina", "limite", "totalPaginas" }`.

> A diferencia del listado, los productos filtrados **no** incluyen `cotizacion`/`cotizacionFecha`.

---

### `GET /api/productos/:id`

**Descripción:** Devuelve un producto por `id` con la cotización de venta actual.

**Autenticación:** Pública.

**Response `200`:**

```json
{
  "id": 6,
  "nombre": "Queso Cremoso",
  "categoria": "Fiambres y quesos",
  "descripcion": "Queso cremoso por kilogramo",
  "precioUsd": 8.5,
  "peso": 14,
  "unidadMedida": "kg",
  "cotizacion": 1580,
  "cotizacionFecha": "2026-11-08T20:45:00.000Z"
}
```

**Errores:** `404` producto no encontrado.

---

### `POST /api/productos/`

**Descripción:** Crea un producto. Obtiene la cotización vigente y guarda su `id` en `idCotizacion` (el `idCotizacion` enviado se ignora).

**Autenticación:** `admin`.

**Request (por unidad):**

```json
{
  "nombre": "Coca-Cola 2.25L",
  "categoria": "Bebidas",
  "descripcion": "Gaseosa botella 2.25 L",
  "precioUsd": 2.5,
  "unidad": 10
}
```

**Request (por peso):**

```json
{
  "nombre": "Queso Cremoso",
  "categoria": "Fiambres y quesos",
  "descripcion": "Queso por kilogramo",
  "precioUsd": 8.5,
  "peso": 14,
  "unidadMedida": "kg"
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `nombre` | string | Sí | |
| `categoria` | string | No | |
| `descripcion` | string | No | |
| `precioUsd` | number | No | Debe ser `>= 0` |
| `unidad` | integer | Según tipo | `>= 0` |
| `peso` | number | Según tipo | `>= 0` |
| `unidadMedida` | string | Según tipo | `"g"`, `"kg"`, `"l"`, `"ml"` |

**Response `201`:** producto creado (incluye `id` e `idCotizacion`).

**Errores:** `400` datos inválidos (nombre, precio, peso, unidad o unidad de medida) · `401`/`403` sin permisos · `502` si falla DolarAPI al consultar la cotización.

---

### `PUT /api/productos/actualizar-precios`

**Descripción:** Actualización masiva de precios según la cotización vigente.

**Autenticación:** `admin`.

**Request:**

```json
{
  "tipo": "porcentaje",
  "valor": 10
}
```

| Campo | Tipo | Obligatorio |
| --- | --- | --- |
| `tipo` | string | Sí |
| `valor` | number | Sí |

**Response `200`:**

```json
{
  "message": "Precios actualizados correctamente",
  "modificados": 8
}
```

> **Limitación actual:** el controlador llama a `actualizarPreciosMasivo(tipo, valor)`, pero el servicio espera un array de productos. Por eso hoy la operación no actualiza precios y `modificados` puede devolver `undefined`. El contrato documentado es el que expone el controlador.

---

### `PUT /api/productos/:id`

**Descripción:** Actualiza parcialmente un producto (merge con los datos anteriores).

**Autenticación:** `admin` o `repositor`.

**Request:** cualquier subconjunto de campos del producto.

**Response `200`:** producto actualizado.

**Errores:** `400` datos inválidos · `404` producto no encontrado.

---

### `DELETE /api/productos/:id`

**Descripción:** Elimina un producto.

**Autenticación:** `admin`.

**Response `204`:** sin body.

**Errores:** `404` producto no encontrado.

---

## Módulo Insumos

Base: `/api/insumos`

> **Importante:** este router se monta **sin** autenticación; todos sus endpoints son públicos en la implementación actual.

### `GET /api/insumos/`

**Descripción:** Lista insumos paginados.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "insumos": [
    {
      "id": 1,
      "nombre": "Harina 000",
      "categoria": "Almacén",
      "descripcion": "",
      "unidad": 25,
      "uso": "Cocina"
    }
  ],
  "total": 12,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 2
}
```

---

### `QUERY /api/insumos/`

**Descripción:** Filtra insumos por propiedades exactas.

**Body**: `{ "categoria": "Packaging" }`

**Response `200`:** `{ "insumos": [...], "total", "pagina", "limite", "totalPaginas" }`.

---

### `GET /api/insumos/:id`

**Descripción:** Busca un insumo por `id`.

**Response `200`:** objeto insumo.

**Errores:** `404` insumo no encontrado.

---

### `POST /api/insumos/`

**Descripción:** Crea un insumo.

**Request:**

```json
{
  "nombre": "Harina 000",
  "categoria": "Almacén",
  "descripcion": "Bolsa de 25 kg",
  "unidad": 25,
  "uso": "Cocina"
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `nombre` | string | Sí | |
| `categoria` | string | No | |
| `descripcion` | string | No | Default `""` |
| `unidad` | integer | Sí | `>= 0` |
| `uso` | string | No | |

**Response `201`:** insumo creado con `id`.

**Errores:** `400` nombre vacío o `unidad` inválida.

---

### `PUT /api/insumos/:id`

**Descripción:** Actualiza parcialmente un insumo.

**Request:** cualquier subconjunto de campos.

**Response `200`:** insumo actualizado.

**Errores:** `400` datos inválidos · `404` insumo no encontrado.

---

### `DELETE /api/insumos/:id`

**Descripción:** Elimina un insumo.

**Response `204`:** sin body.

**Errores:** `404` insumo no encontrado.

---

## Módulo Ingresos / Ventas

Base: `/api/ingreso`

Un **ingreso** es una transacción con `monto > 0` (ventas, entradas de dinero).

**Autenticación:** middleware `allowRoles("cajero")` en todo el router (el `admin` también accede).

### `GET /api/ingreso/`

**Descripción:** Lista ingresos paginados.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "ingresos": [
    {
      "id": 6,
      "monto": 42000,
      "idUsuario": 3,
      "idCaja": 1,
      "fecha": "2026-11-02T12:30:00.000Z",
      "metodoDePago": "efectivo",
      "articulos": [{ "id": 1, "cantidad": 2 }]
    }
  ],
  "total": 20,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 2
}
```

---

### `QUERY /api/ingreso/`

**Descripción:** Filtra ingresos por propiedades exactas.

**Body**: `{ "metodoDePago": "efectivo" }`

**Response `200`:** `{ "ingresos": [...], "total", "pagina", "limite", "totalPaginas" }`.

---

### `GET /api/ingreso/:id`

**Descripción:** Busca un ingreso por `id`.

**Response `200`:** objeto ingreso.

**Errores:** `404` ingreso no encontrado.

---

### `POST /api/ingreso/`

**Descripción:** Crea un ingreso genérico de dinero.

**Request:**

```json
{
  "monto": 15000,
  "idUsuario": 3,
  "idCaja": 1,
  "metodoDePago": "efectivo",
  "articulos": [],
  "fecha": "2026-11-14T12:00:00.000Z"
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `monto` | integer | Sí | `> 0` |
| `idUsuario` | integer | Sí | |
| `idCaja` | integer | No | |
| `metodoDePago` | string | Sí | `efectivo`, `transferencia`, etc. |
| `articulos` | array | No | Default `[]` |
| `fecha` | string (ISO) | No | Default ahora |

**Response `201`:** ingreso creado con `id`.

**Errores:** `400` monto menor o igual a 0 · `401`/`403` sin permisos.

---

### `POST /api/ingreso/venta`

**Descripción:** Registra una venta completa: descuenta stock de los productos, crea la transacción de ingreso y ejecuta todo en una transacción con rollback ante errores. El `idUsuario` se toma de la sesión.

**Request:**

```json
{
  "idCaja": 1,
  "metodoDePago": "efectivo",
  "monto": 7800,
  "articulos": [
    { "id": 1, "unidad": 2 },
    { "id": 6, "peso": 1.5 }
  ]
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `articulos` | array | Sí | Debe ser un array |
| `articulos[].id` | integer | Sí | Id del producto |
| `articulos[].unidad` / `peso` | number | Sí | Cantidad a descontar; debe ser positiva y no superar el stock |
| `idCaja` | integer | Sí | Caja asociada |
| `metodoDePago` | string | Sí | |
| `monto` | integer | Sí | `> 0` |

**Response `201`:** transacción creada + detalle de artículos actualizados.

```json
{
  "id": 21,
  "monto": 7800,
  "idUsuario": 3,
  "idCaja": 1,
  "fecha": "2026-11-14T12:00:00.000Z",
  "metodoDePago": "efectivo",
  "articulos": [
    {
      "id": 1,
      "nombre": "Coca-Cola 2.25L",
      "categoria": "Bebidas",
      "descripcion": "...",
      "precioUsd": 2.5,
      "unidad": 8,
      "idCotizacion": 5,
      "cantidad": 2
    }
  ]
}
```

**Errores:** `400` artículos no es array, cantidad inválida o stock insuficiente · `404` producto no encontrado.

---

### `PUT /api/ingreso/:id`

**Descripción:** Actualiza parcialmente un ingreso.

**Request:** subconjunto de campos; si se envía `monto`, debe ser `>= 0`.

**Response `200`:** ingreso actualizado.

**Errores:** `400` monto inválido · `404` ingreso no encontrado.

---

### `DELETE /api/ingreso/:id`

**Descripción:** Elimina un ingreso.

**Response `204`:** sin body.

**Errores:** `404` ingreso no encontrado.

---

## Módulo Egresos / Compras

Base: `/api/egreso`

Un **egreso** es una transacción con `monto <= 0` (compras, retiros, salidas de dinero).

**Autenticación:** middleware `allowRoles("repositor")` en todo el router (el `admin` también accede).

### `GET /api/egreso/`

**Descripción:** Lista egresos paginados.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "egresos": [
    {
      "id": 1,
      "monto": -85000,
      "idUsuario": 2,
      "idCaja": 1,
      "fecha": "2026-11-02T10:30:00.000Z",
      "metodoDePago": "efectivo",
      "articulos": [{ "id": 1, "tipo": "producto", "cantidad": 20 }]
    }
  ],
  "total": 20,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 2
}
```

---

### `QUERY /api/egreso/`

**Descripción:** Filtra egresos por propiedades exactas.

**Body**: `{ "metodoDePago": "transferencia" }`

**Response `200`:** `{ "egresos": [...], "total", "pagina", "limite", "totalPaginas" }`.

---

### `GET /api/egreso/:id`

**Descripción:** Busca un egreso por `id`.

**Response `200`:** objeto egreso.

**Errores:** `404` egreso no encontrado.

---

### `POST /api/egreso/`

**Descripción:** Crea un egreso genérico.

**Request:**

```json
{
  "monto": -20000,
  "idUsuario": 2,
  "idCaja": 1,
  "metodoDePago": "efectivo",
  "articulos": [],
  "fecha": "2026-11-14T12:00:00.000Z"
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `monto` | integer | Sí | `<= 0` |
| `idUsuario` | integer | Sí | |
| `idCaja` | integer | No | |
| `metodoDePago` | string | Sí | |
| `articulos` | array | No | Default `[]` |
| `fecha` | string (ISO) | No | Default ahora |

**Response `201`:** egreso creado con `id`.

**Errores:** `400` monto mayor a 0 · `401`/`403` sin permisos.

---

### `POST /api/egreso/compra`

**Descripción:** Registra una compra: aumenta stock de productos/insumos existentes o crea artículos nuevos, y genera el egreso. Todo se ejecuta en una transacción con rollback ante errores. El `idUsuario` se toma de la sesión.

**Request:**

```json
{
  "idCaja": 1,
  "metodoDePago": "transferencia",
  "monto": -65000,
  "articulos": [
    {
      "tipo": "producto",
      "id": 1,
      "unidad": 20
    },
    {
      "tipo": "insumo",
      "id": 5,
      "unidad": 10
    },
    {
      "tipo": "producto",
      "nombre": "Producto nuevo",
      "categoria": "Almacén",
      "precioUsd": 3.2,
      "unidad": 12
    }
  ]
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `articulos` | array | Sí | Debe ser un array |
| `articulos[].tipo` | `"producto"` \| `"insumo"` | Sí | Cualquier otro valor produce error |
| `articulos[].id` | integer | No | Si existe, aumenta stock; si no, crea el artículo |
| `articulos[].unidad` / `peso` | number | Sí | Cantidad a sumar |
| `idCaja` | integer | Sí | |
| `metodoDePago` | string | Sí | |
| `monto` | integer | Sí | `<= 0` |

**Response `201`:** egreso creado + artículos procesados.

**Errores:** `400` artículos no es array, tipo inválido, cantidad inválida o monto > 0 · `404` artículo no encontrado.

---

### `PUT /api/egreso/:id`

**Descripción:** Actualiza parcialmente un egreso, validando que el monto final sea `<= 0`.

**Response `200`:** egreso actualizado.

**Errores:** `400` monto inválido · `404` egreso no encontrado.

---

### `DELETE /api/egreso/:id`

**Descripción:** Elimina un egreso.

**Response `204`:** sin body.

**Errores:** `404` egreso no encontrado.

---

## Módulo Caja

Base: `/api/caja`

**Autenticación:** middleware `allowRoles("cajero")` en todo el router (el `admin` también accede).

### `GET /api/caja/`

**Descripción:** Lista cajas paginadas.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "cajas": [
    {
      "id": 1,
      "nroCaja": 1,
      "usuarioAbre": 1,
      "usuarioCierra": 1,
      "montoInicial": 70000,
      "totalEsperado": 156200,
      "totalContado": 156000,
      "diferencia": -200,
      "fechaApertura": "2026-11-02T09:00:00.000Z",
      "fechaCierre": "2026-11-02T19:00:00.000Z",
      "estado": "cerrada",
      "observaciones": ["Se detectó un faltante de $200"],
      "historialDeTransacciones": [6, 7, 11, 12, 16, 17]
    }
  ],
  "total": 3,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

---

### `QUERY /api/caja/`

**Descripción:** Filtra cajas por propiedades exactas.

**Body**: `{ "estado": "abierta" }`

**Response `200`:** `{ "cajas": [...], "total", "pagina", "limite", "totalPaginas" }`.

---

### `GET /api/caja/:id`

**Descripción:** Busca una caja por `id`.

**Response `200`:** objeto caja.

**Errores:** `404` caja no encontrada.

---

### `POST /api/caja/`

**Descripción:** Abre/crea una caja.

**Request:**

```json
{
  "nroCaja": 4,
  "usuarioAbre": 3,
  "montoInicial": 50000,
  "observaciones": ["Apertura de turno tarde"]
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `nroCaja` | integer | Sí | |
| `usuarioAbre` | integer | Sí | |
| `montoInicial` | number | No | `>= 0`, default `0` |
| `totalEsperado` | number | No | Default `montoInicial` |
| `observaciones` | string[] | No | Default `[]` |
| `historialDeTransacciones` | array | No | Default `[]` |
| `estado` | `"abierta"` \| `"cerrada"` | No | Default `"abierta"` |
| `usuarioCierra`, `totalContado`, `diferencia`, `fechaCierre` | — | No | Solo para cajas ya cerradas |

**Response `201`:** caja creada con `id` y `fechaApertura`.

**Errores:** `400` datos inválidos.

---

### `POST /api/caja/:id/venta`

**Descripción:** Registra una venta sobre una caja abierta. Descuenta stock, crea el ingreso y actualiza `totalEsperado` e historial. Usa transacción con rollback.

**Request:**

```json
{
  "metodoDePago": "efectivo",
  "monto": 7800,
  "articulos": [
    { "id": 1, "unidad": 2 }
  ]
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `monto` | number | Sí | `> 0` |
| `metodoDePago` | string | Sí | Solo suma a `totalEsperado` si es `"efectivo"` |
| `articulos` | array | Sí | Mismo formato que `POST /api/ingreso/venta` |

**Response `201`:**

```json
{
  "id": 1,
  "totalEsperado": 164000,
  "venta": {
    "id": 21,
    "monto": 7800,
    "idUsuario": 3,
    "idCaja": 1,
    "metodoDePago": "efectivo",
    "articulos": []
  }
}
```

**Errores:** `400` caja cerrada, monto inválido o stock insuficiente · `404` caja o producto inexistente.

---

### `POST /api/caja/:id/retiro`

**Descripción:** Registra un retiro de efectivo. Crea un egreso negativo, descuenta del `totalEsperado` y actualiza el historial. Usa transacción con rollback.

**Request:**

```json
{
  "monto": 5000,
  "metodoDePago": "efectivo"
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `monto` | number | Sí | Se envía positivo; internamente se registra como negativo |
| `metodoDePago` | string | No | Se fuerza a `"efectivo"` |

**Response `201`:**

```json
{
  "id": 1,
  "totalEsperado": 159000,
  "egreso": {
    "id": 22,
    "monto": -5000,
    "idUsuario": 3,
    "idCaja": 1,
    "metodoDePago": "efectivo",
    "articulos": []
  }
}
```

**Errores:** `400` caja cerrada, monto inválido o efectivo insuficiente · `404` caja inexistente.

---

### `PUT /api/caja/:id`

**Descripción:** Actualiza parcialmente una caja.

**Request:** subconjunto de campos de la caja.

**Response `200`:** caja actualizada.

**Errores:** `400` datos inválidos · `404` caja no encontrada.

---

### `PUT /api/caja/:id/cerrar`

**Descripción:** Realiza el arqueo y cierre de una caja abierta. Calcula `diferencia = totalContado - totalEsperado`, guarda el usuario que cierra (de la sesión), la fecha de cierre y pasa el estado a `"cerrada"`.

**Request:**

```json
{
  "totalContado": 159000,
  "observaciones": ["Arqueo sin diferencias"]
}
```

| Campo | Tipo | Obligatorio | Notas |
| --- | --- | --- | --- |
| `totalContado` | number | Sí | `>= 0` |
| `observaciones` | string[] | No | Se agregan a las existentes |

**Response `200`:** caja cerrada.

```json
{
  "id": 1,
  "nroCaja": 1,
  "usuarioAbre": 1,
  "usuarioCierra": 3,
  "montoInicial": 70000,
  "totalEsperado": 159000,
  "totalContado": 159000,
  "diferencia": 0,
  "fechaApertura": "2026-11-02T09:00:00.000Z",
  "fechaCierre": "2026-11-14T20:00:00.000Z",
  "estado": "cerrada",
  "observaciones": ["Arqueo sin diferencias"],
  "historialDeTransacciones": []
}
```

**Errores:** `400` caja ya cerrada o `totalContado` inválido · `404` caja no encontrada.

---

### `DELETE /api/caja/:id`

**Descripción:** Elimina una caja.

**Response `204`:** sin body.

**Errores:** `404` caja no encontrada.

---

## Módulo Cotización

Base: `/api/cotizacion`

Obtiene el dólar blue desde `https://dolarapi.com/v1/dolares/blue`.

**Autenticación:** `requireAuth` + `allowRoles("admin")` en todo el router.

### `GET /api/cotizacion/`

**Descripción:** Devuelve la cotización vigente. Solo consulta la API externa si pasaron más de 3 horas desde la última consulta **y** la hora UTC está entre 14 y 20; si no, devuelve la última cotización guardada. Si la cotización externa tiene la misma fecha y valor que la última, solo actualiza la fecha.

**Response `200`:**

```json
{
  "cotizacion": {
    "id": 4,
    "moneda": "USD",
    "casa": "blue",
    "fechaActualizacion": "2026-11-08T20:45:00.000Z",
    "venta": 1580
  }
}
```

**Errores:** `502` DolarAPI no disponible o con datos inválidos.

---

### `GET /api/cotizacion/listar`

**Descripción:** Lista el historial de cotizaciones paginado.

**Query params:** `pagina`, `limite`.

**Response `200`:**

```json
{
  "cotizacion": [
    {
      "id": 1,
      "moneda": "USD",
      "casa": "blue",
      "fechaActualizacion": "2026-11-02T20:58:00.000Z",
      "venta": 1540
    }
  ],
  "total": 4,
  "pagina": 1,
  "limite": 10,
  "totalPaginas": 1
}
```

---

### `GET /api/cotizacion/:id`

**Descripción:** Busca una cotización por `id`. Si el `id` no se envía o no existe, devuelve la última cotización registrada.

**Response `200`:** objeto cotización.

---

## Módulo Categorías

Base: `/api/categorias`

**Autenticación:** `requireAuth` en todo el router (cualquier rol autenticado).

### `GET /api/categorias/`

**Descripción:** Lista categorías paginadas.

**Query params:** `pagina`, `limite`.

**Response `200`:** la respuesta queda **anidada dos veces** (comportamiento actual del controlador + servicio):

```json
{
  "categorias": {
    "categorias": [
      {
        "id": 2,
        "nombre": "Bebidas",
        "productos": ["Coca-Cola 2.25L"]
      }
    ],
    "total": 1,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 1
  }
}
```

---

### `QUERY /api/categorias/`

**Descripción:** Filtra categorías por propiedades exactas.

**Body**: `{ "nombre": "Bebidas" }`

**Response `200`:** resultado crudo del repositorio envuelto por el controlador:

```json
{
  "categorias": {
    "datos": [{ "id": 2, "nombre": "Bebidas", "productos": [] }],
    "total": 1,
    "pagina": 1,
    "limite": 10,
    "totalPaginas": 1
  }
}
```

---

### `GET /api/categorias/:id`

**Descripción:** Busca una categoría por `id`.

**Response `200`:**

```json
{
  "categoria": {
    "id": 2,
    "nombre": "Bebidas",
    "productos": ["Coca-Cola 2.25L"]
  }
}
```

**Errores:** `404` categoría no encontrada.

---

### `POST /api/categorias/`

**Descripción:** Crea una categoría. El nombre es obligatorio y no puede repetirse.

**Request:**

```json
{ "nombre": "Bebidas" }
```

**Response `201`:**

```json
{
  "categoria": {
    "id": 4,
    "nombre": "Bebidas",
    "productos": []
  }
}
```

**Errores:** `400` nombre vacío o duplicado.

---

### `PATCH /api/categorias/:id/nombre`

**Descripción:** Cambia el nombre de una categoría.

**Request:**

```json
{ "nombre": "Bebidas sin alcohol" }
```

**Response `201`:** (sí, el controlador responde 201)

```json
{
  "categoria": {
    "id": 4,
    "nombre": "Bebidas sin alcohol",
    "productos": []
  }
}
```

**Errores:** `400` nombre vacío o duplicado · `404` categoría no encontrada.

---

### `PATCH /api/categorias/:id/productos`

**Descripción:** Agrega productos a la categoría (concatena con los existentes).

**Request:**

```json
{ "productos": ["Coca-Cola 2.25L", "Fanta 2.25L"] }
```

**Response `201`:**

```json
{
  "categoria": {
    "id": 4,
    "nombre": "Bebidas",
    "productos": ["Coca-Cola 2.25L", "Fanta 2.25L"]
  }
}
```

**Errores:** `404` categoría no encontrada.

---

### `DELETE /api/categorias/:id`

**Descripción:** Elimina una categoría.

**Response `204`:** sin body.

**Errores:** `404` categoría no encontrada.

---

## Módulo Configuración

Base: `/api/configuracion`

**Autenticación:** `requireAuth` en todo el router. Las rutas `PATCH` usan `allowRoles()` sin argumentos, por lo que **solo `admin`** puede modificarlas.

Estructura de configuración:

```json
{
  "sessionExpiringTime": 28800000,
  "negocio": {
    "nombre": "Mi Comercio",
    "telefono": "",
    "direccion": ""
  },
  "stock": {
    "critico": 5,
    "medio": 15
  }
}
```

### `GET /api/configuracion/`

**Descripción:** Devuelve toda la configuración. Agrega `sessionDurationMinutes` (minutos calculados desde `sessionExpiringTime`).

**Response `200`:**

```json
{
  "configuracion": {
    "sessionExpiringTime": 28800000,
    "sessionDurationMinutes": 480,
    "negocio": {
      "nombre": "Mi Comercio",
      "telefono": "",
      "direccion": ""
    },
    "stock": {
      "critico": 5,
      "medio": 15
    }
  }
}
```

---

### `GET /api/configuracion/stock`

**Descripción:** Devuelve solo los umbrales de stock.

**Response `200`:**

```json
{
  "stock": {
    "critico": 5,
    "medio": 15
  }
}
```

---

### `GET /api/configuracion/sesion`

**Descripción:** Devuelve la duración de sesión configurada (en milisegundos).

**Response `200`:**

```json
{ "sessionExpiringTime": 28800000 }
```

---

### `GET /api/configuracion/negocio`

**Descripción:** *Debería* devolver los datos del negocio.

**Response `200` actual:** por un error de cableado en `configuracion.routes.js`, esta ruta apunta a `obtenerSesion`, por lo que devuelve:

```json
{ "sessionExpiringTime": 28800000 }
```

---

### `PATCH /api/configuracion/negocio`

**Descripción:** Actualiza los datos del negocio (merge). **Solo admin.**

**Request:** al menos un campo.

```json
{
  "nombre": "Kiosco Central",
  "telefono": "1234-5678",
  "direccion": "Av. Siempre Viva 742"
}
```

| Campo | Tipo | Límite |
| --- | --- | --- |
| `nombre` | string | No vacío, máx. 120 |
| `telefono` | string | máx. 40 |
| `direccion` | string | máx. 200 |

**Response `200`:**

```json
{
  "configuracion": {
    "sessionExpiringTime": 28800000,
    "sessionDurationMinutes": 480,
    "negocio": {
      "nombre": "Kiosco Central",
      "telefono": "1234-5678",
      "direccion": "Av. Siempre Viva 742"
    },
    "stock": { "critico": 5, "medio": 15 }
  }
}
```

**Errores:** `400` campo inválido o sin datos.

---

### `PATCH /api/configuracion/expiracion`

**Descripción:** Actualiza la duración de la sesión en minutos. **Solo admin.**

**Request:**

```json
{ "sessionDurationMinutes": 120 }
```

| Campo | Tipo | Rango |
| --- | --- | --- |
| `sessionDurationMinutes` | integer | `0..1440` |

**Response `200`:**

```json
{
  "configuracion": {
    "sessionExpiringTime": 7200000,
    "sessionDurationMinutes": 120,
    "negocio": { "...": "..." },
    "stock": { "...": "..." }
  }
}
```

**Errores:** `400` valor fuera de rango.

---

### `PATCH /api/configuracion/stock`

**Descripción:** Actualiza los umbrales de stock. **Solo admin.**

**Request:** se puede enviar uno o ambos.

```json
{ "critico": 3, "medio": 10 }
```

| Campo | Tipo | Regla |
| --- | --- | --- |
| `critico` | integer | `>= 0` |
| `medio` | integer | `> critico` |

**Response `200`:** `{ "configuracion": { ... } }` con la configuración actualizada.

**Errores:** `400` valores inválidos.

---

### `PATCH /api/configuracion/sesion`

**Descripción:** Actualiza la duración de la sesión en horas. **Solo admin.**

**Request:**

```json
{ "duracionHoras": 8 }
```

| Campo | Tipo | Rango |
| --- | --- | --- |
| `duracionHoras` | integer | `1..24` |

**Response `200`:**

```json
{
  "configuracion": {
    "duracionHoras": 8,
    "duracionSesion": 28800000
  }
}
```

**Errores:** `400` valor fuera de rango.

---

## Rutas web (HTML)

Además de la API, `server.js` expone:

| Método | Ruta | Descripción | Acceso |
| --- | --- | --- | --- |
| `GET` | `/` | Redirige a `/login.html` | Público |
| `GET` | `/login.html` | Página de login | Público |
| `GET` | `/caja.html` | Panel de caja | `cajero` o `admin` |
| `GET` | `/repositor.html` | Panel de repositor/inventario | `repositor` o `admin` |
| `GET` | `/admin.html` | Panel de administración | `admin` |
| `GET` | `/*` (estáticos) | Archivos de `public/` | Público |
| `GET` | ruta inexistente | `404` (Problem Details) | — |

---

## Resumen de permisos por módulo

| Módulo | Lectura | Escritura |
| --- | --- | --- |
| `/api/auth` | Público (`login`, `logout`) | `signup` solo `admin` |
| `/api/usuarios` | Público | Público |
| `/api/productos` | Público | Crear/eliminar: `admin`; actualizar: `admin` o `repositor` |
| `/api/insumos` | Público | Público |
| `/api/ingreso` | `cajero` o `admin` | `cajero` o `admin` |
| `/api/egreso` | `repositor` o `admin` | `repositor` o `admin` |
| `/api/caja` | `cajero` o `admin` | `cajero` o `admin` |
| `/api/cotizacion` | `admin` | — |
| `/api/categorias` | Cualquier usuario autenticado | Cualquier usuario autenticado |
| `/api/configuracion` | Cualquier usuario autenticado | Solo `admin` |

---

## Arquitectura 

El backend sigue una arquitectura en capas por módulo:

```
src/
├── common/
│   ├── config/          # DI, Factory, Repository base
│   ├── errors/          # Clases de error (AppError y derivados)
│   ├── middlewares/     # auth.guard, errorHandler
│   ├── seeders/         # Datos de prueba
│   └── utils/           # Paginación y comparación de propiedades
└── modules/
    └── <modulo>/
        ├── *.routes.js       # Define endpoints y middlewares
        ├── *.controller.js   # Traduce HTTP <-> servicio
        ├── *.service.js      # Reglas de negocio
        ├── *.entity.js       # Validación y modelo de dominio
        └── *.repository.js   # (cuando aplica) persistencia especial
data/*.json                # Persistencia de los Repository (raíz del proyecto)
```

Flujo de una petición: `routes → controller → service → repository → data/*.json`.

---

### Inyección de dependencias

`DependencyInjector` (`src/common/config/dependencyInjector.js`) registra fábricas asociadas a un token:

- `registerSingleton(token, factory)`: crea la instancia una sola vez (cachea la promesa).
- `registerTransient(token, factory)`: crea una instancia nueva en cada `resolve`.
- `resolve(token)`: resuelve la dependencia de forma asíncrona.

Todo el grafo se registra en `src/common/config/app.module.js`: repositorios → servicios → controladores. Los repositorios son singletons que cargan su archivo JSON al inicializarse. `server.js` resuelve cada controlador y lo pasa a su función `crearRouter...`, y el `Seeder` resuelve los repositorios de la misma forma.

---

### Factory

`Factory` (`src/common/config/factory.js`) convierte objetos planos (JSON) en instancias de entidades con validación:

| Método | Resultado |
| --- | --- |
| `crearUsuario` | `Usuario` |
| `crearProducto` | `ProductoUnidad` si tiene `unidad`; `ProductoPeso` si tiene `peso` |
| `crearInsumo` | `Insumo` |
| `crearTransaccion` | `Ingreso` si `monto > 0`; `Egreso` si `monto <= 0` |
| `crearCotizacion` | `Cotizacion` |
| `crearCaja` | `Caja` |
| `crearCategoria` | `Categoria` |
| `crearConfiguracion` | Devuelve el objeto tal cual (sin entidad) |

El `Repository` base usa la factory al cargar, crear y actualizar entidades, por lo que las validaciones de las entidades se aplican en cada operación.

---

### Seeder

`npm run seed` ejecuta `src/common/seeders/index.js`.

1. `crearSeeder()` resuelve los repositorios mediante el inyector de dependencias.
2. `Seeder.ejecutar()` carga los datos mock de `src/common/seeders/data/` (`usuarios`, `productos`, `insumos`, `transacciones`, `cotizaciones`, `caja`).
3. Por cada repositorio: `cargarDesdeJson(mocks)` → `guardar()` → `cargar()`.
4. Imprime `"Seeder ejecutado correctamente."`.

Consideraciones:

- **Sobrescribe** el contenido de los archivos JSON de `data/`.
- No incluye seed de categorías; la configuración se deja con sus valores por defecto.
- Incluye usuarios de prueba con roles `admin`, `repositor` y `cajero` (`admin@kchin.com`, `repositor@kchin.com`, `cajero@kchin.com`), además de un usuario deshabilitado.

---

## Notas de implementación

- La persistencia es en archivos JSON (`data/*.json`); los repositorios implementan transacciones en memoria con `iniciarTransaccion`, `confirmarTransaccion` y `rollback`.
- Los listados y filtrados comparan por igualdad exacta sobre las propiedades de la entidad. Los objetos y arrays se comparan de forma recursiva/contención.
- La validación de entidades puede lanzar `400` con el detalle del campo inválido.
- Los endpoints de filtrado usan el método HTTP **`QUERY`**, soportado por Node 24/Express 5. Si el cliente no lo soporta, puede usar `fetch`/`curl` con `-X QUERY`.
