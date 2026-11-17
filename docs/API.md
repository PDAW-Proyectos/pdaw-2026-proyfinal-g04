# API — KCHIN

- **URL base:** `http://localhost:3000` (variable de entorno `PORT`, por defecto `3000`)
- **Formato:** JSON (`Content-Type: application/json` en peticiones con body)
- **Autenticación:** cookie de sesión `connect.sid` (express-session)
- **Detalles técnicos y reglas de negocio:** ver [ARCHITECTURE.md](../ARCHITECTURE.md)

---

## Módulo Auth

Base: `/api/auth`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| POST | `/api/auth/login` | — | `email` o `correo`: string (req)<br>`password` o `contrasena`: string (req)<br>`requestedRole`: `"admin"` \| `"repositor"` \| `"cajero"` (opt) | `200` `{idUsuario, nombre, email, rol, mensaje}` | `401` credenciales incorrectas<br>`403` rol solicitado no coincide |
| POST | `/api/auth/signup` | — | `nombre`: string (req)<br>`apellido`: string (req)<br>`email`: string (req)<br>`password`: string (req)<br>`rol`: `"admin"` \| `"repositor"` \| `"cajero"` (req) | `201` `{id, nombre, apellido, email, contraseña, rol, habilitado}` | `400` datos inválidos<br>`409` email en uso<br>`401`/`403` sin sesión o rol |
| POST | `/api/auth/logout` | — | Sin body | `200` `{mensaje}` | — |
| GET | `/api/auth/me` | — | Sin body | `200` `{id, nombre, apellido, email, rol}` | `401` sin sesión |

## Módulo Usuarios

Base: `/api/usuarios`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/usuarios/` | `pagina, limite` | Sin body | `200` `{usuarios:[{id,email,contraseña,nombre,apellido,habilitado,rol}], total, pagina, limite, totalPaginas}` | — |
| QUERY | `/api/usuarios/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{rol:"cajero"}`) | `200` `{usuarios:[...], total, pagina, limite, totalPaginas}` | — |
| GET | `/api/usuarios/:id` | — | Sin body | `200` objeto usuario | `404` no encontrado |
| POST | `/api/usuarios/` | — | `email`: string (req)<br>`contraseña`: string (req)<br>`nombre`: string (req)<br>`apellido`: string (req)<br>`rol`: string (req)<br>`habilitado`: boolean (opt, default `true`) | `201` usuario con `id` | `400` email o contraseña vacíos |
| PUT | `/api/usuarios/:id` | — | Subconjunto de campos del usuario | `200` usuario actualizado | `404` no encontrado |
| DELETE | `/api/usuarios/:id` | — | Sin body | Sin body (204) | `404` no encontrado |

## Módulo Productos

Base: `/api/productos`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/productos/` | `pagina, limite` | Sin body | `200` `{productos:[{id,nombre,categoria,descripcion,precioUsd,unidad o peso,unidadMedida?,cotizacion,cotizacionFecha}], total, pagina, limite, totalPaginas}` | — |
| QUERY | `/api/productos/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{categoria:"Bebidas"}`) | `200` `{productos:[... sin cotizacion ni cotizacionFecha], total, pagina, limite, totalPaginas}` | — |
| GET | `/api/productos/:id` | — | Sin body | `200` `{id,nombre,categoria,descripcion,precioUsd,unidad o peso,unidadMedida?,cotizacion,cotizacionFecha}` | `404` no encontrado |
| POST | `/api/productos/` | — | `nombre`: string (req)<br>`categoria`: string (opt)<br>`descripcion`: string (opt)<br>`precioUsd`: number (opt, `>=0`)<br>`unidad`: integer (req si por unidad, `>=0`)<br>`peso`: number (req si por peso, `>=0`)<br>`unidadMedida`: `"g"` \| `"kg"` \| `"l"` \| `"ml"` (req si por peso) | `201` producto con `id` e `idCotizacion` | `400` datos inválidos<br>`401`/`403` sin permisos<br>`502` DolarAPI |
| PUT | `/api/productos/actualizar-precios` | — | `tipo`: string (req)<br>`valor`: number (req) | `200` `{message, modificados}` | `401`/`403` sin permisos |
| PUT | `/api/productos/:id` | — | Subconjunto de campos del producto | `200` producto actualizado | `400` datos inválidos<br>`404` no encontrado |
| DELETE | `/api/productos/:id` | — | Sin body | Sin body (204) | `404` no encontrado |

## Módulo Insumos

Base: `/api/insumos`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/insumos/` | `pagina, limite` | Sin body | `200` `{insumos:[{id,nombre,categoria,descripcion,unidad,uso}], total, pagina, limite, totalPaginas}` | — |
| QUERY | `/api/insumos/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{categoria:"Packaging"}`) | `200` `{insumos:[...], total, pagina, limite, totalPaginas}` | — |
| GET | `/api/insumos/:id` | — | Sin body | `200` objeto insumo | `404` no encontrado |
| POST | `/api/insumos/` | — | `nombre`: string (req)<br>`categoria`: string (opt)<br>`descripcion`: string (opt, default `""`)<br>`unidad`: integer (req, `>=0`)<br>`uso`: string (opt) | `201` insumo con `id` | `400` nombre vacío o unidad inválida |
| PUT | `/api/insumos/:id` | — | Subconjunto de campos del insumo | `200` insumo actualizado | `400` datos inválidos<br>`404` no encontrado |
| DELETE | `/api/insumos/:id` | — | Sin body | Sin body (204) | `404` no encontrado |

## Módulo Ingresos

Base: `/api/ingreso`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/ingreso/` | `pagina, limite` | Sin body | `200` `{ingresos:[{id,monto,idUsuario,idCaja,fecha,metodoDePago,articulos:[{id,cantidad}]}], total, pagina, limite, totalPaginas}` | `401`/`403` sin permisos |
| QUERY | `/api/ingreso/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{metodoDePago:"efectivo"}`) | `200` `{ingresos:[...], total, pagina, limite, totalPaginas}` | `401`/`403` sin permisos |
| GET | `/api/ingreso/:id` | — | Sin body | `200` objeto ingreso | `404` no encontrado |
| POST | `/api/ingreso/` | — | `monto`: integer (req, `>0`)<br>`idUsuario`: integer (req)<br>`idCaja`: integer (opt)<br>`metodoDePago`: string (req)<br>`articulos`: array (opt, default `[]`)<br>`fecha`: ISO string (opt, default ahora) | `201` ingreso con `id` | `400` monto `<=0`<br>`401`/`403` sin permisos |
| POST | `/api/ingreso/venta` | — | `idCaja`: integer (req)<br>`metodoDePago`: string (req)<br>`monto`: integer (req, `>0`)<br>`articulos`: array (req) de `{id: integer (req), unidad o peso: number (req, >0 y <= stock)}` | `201` transacción con `id`, monto, idUsuario (de sesión), idCaja, fecha, metodoDePago, articulos (con datos de producto y `cantidad`) | `400` artículos inválidos o stock insuficiente<br>`404` producto no encontrado |
| PUT | `/api/ingreso/:id` | — | Subconjunto de campos; si se envía `monto`, `>=0` | `200` ingreso actualizado | `400` monto inválido<br>`404` no encontrado |
| DELETE | `/api/ingreso/:id` | — | Sin body | Sin body (204) | `404` no encontrado |

## Módulo Egresos

Base: `/api/egreso`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/egreso/` | `pagina, limite` | Sin body | `200` `{egresos:[{id,monto,idUsuario,idCaja,fecha,metodoDePago,articulos:[{id,tipo,cantidad}]}], total, pagina, limite, totalPaginas}` | `401`/`403` sin permisos |
| QUERY | `/api/egreso/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{metodoDePago:"transferencia"}`) | `200` `{egresos:[...], total, pagina, limite, totalPaginas}` | `401`/`403` sin permisos |
| GET | `/api/egreso/:id` | — | Sin body | `200` objeto egreso | `404` no encontrado |
| POST | `/api/egreso/` | — | `monto`: integer (req, `<=0`)<br>`idUsuario`: integer (req)<br>`idCaja`: integer (opt)<br>`metodoDePago`: string (req)<br>`articulos`: array (opt, default `[]`)<br>`fecha`: ISO string (opt, default ahora) | `201` egreso con `id` | `400` monto `>0`<br>`401`/`403` sin permisos |
| POST | `/api/egreso/compra` | — | `idCaja`: integer (req)<br>`metodoDePago`: string (req)<br>`monto`: integer (req, `<=0`)<br>`articulos`: array (req) de `{tipo:"producto"\|"insumo" (req), id: integer (opt, si existe aumenta stock), unidad o peso: number (req, >0), nombre/categoria/precioUsd/etc. (opt al crear)}` | `201` egreso + artículos procesados | `400` artículos inválidos, tipo inválido, cantidad inválida o monto `>0`<br>`404` artículo no encontrado |
| PUT | `/api/egreso/:id` | — | Subconjunto de campos; monto final debe ser `<=0` | `200` egreso actualizado | `400` monto inválido<br>`404` no encontrado |
| DELETE | `/api/egreso/:id` | — | Sin body | Sin body (204) | `404` no encontrado |

## Módulo Caja

Base: `/api/caja`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/caja/` | `pagina, limite` | Sin body | `200` `{cajas:[{id,nroCaja,usuarioAbre,usuarioCierra,montoInicial,totalEsperado,totalContado,diferencia,fechaApertura,fechaCierre,estado,observaciones,historialDeTransacciones}], total, pagina, limite, totalPaginas}` | `401`/`403` sin permisos |
| QUERY | `/api/caja/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{estado:"abierta"}`) | `200` `{cajas:[...], total, pagina, limite, totalPaginas}` | `401`/`403` sin permisos |
| GET | `/api/caja/:id` | — | Sin body | `200` objeto caja | `404` no encontrada |
| POST | `/api/caja/` | — | `nroCaja`: integer (req)<br>`usuarioAbre`: integer (req)<br>`montoInicial`: number (opt, `>=0`, default `0`)<br>`totalEsperado`: number (opt, default `montoInicial`)<br>`observaciones`: string[] (opt, default `[]`)<br>`historialDeTransacciones`: array (opt, default `[]`)<br>`estado`: `"abierta"` \| `"cerrada"` (opt, default `"abierta"`)<br>`usuarioCierra`, `totalContado`, `diferencia`, `fechaCierre`: solo cajas ya cerradas (opt) | `201` caja con `id` y `fechaApertura` | `400` datos inválidos |
| POST | `/api/caja/:id/venta` | — | `monto`: number (req, `>0`)<br>`metodoDePago`: string (req; solo suma a `totalEsperado` si es `"efectivo"`)<br>`articulos`: array (req, mismo formato que `/api/ingreso/venta`) | `201` `{id, totalEsperado, venta:{id,monto,idUsuario,idCaja,metodoDePago,articulos}}` | `400` caja cerrada, monto inválido o stock insuficiente<br>`404` caja o producto inexistente |
| POST | `/api/caja/:id/retiro` | — | `monto`: number (req, positivo; se registra negativo)<br>`metodoDePago`: string (opt, se fuerza a `"efectivo"`) | `201` `{id, totalEsperado, egreso:{id,monto,idUsuario,idCaja,metodoDePago,articulos}}` | `400` caja cerrada, monto inválido o efectivo insuficiente<br>`404` caja inexistente |
| PUT | `/api/caja/:id` | — | Subconjunto de campos de la caja | `200` caja actualizada | `400` datos inválidos<br>`404` no encontrada |
| PUT | `/api/caja/:id/cerrar` | — | `totalContado`: number (req, `>=0`)<br>`observaciones`: string[] (opt, se agregan a existentes) | `200` caja cerrada con `diferencia = totalContado - totalEsperado` | `400` caja ya cerrada o totalContado inválido<br>`404` no encontrada |
| DELETE | `/api/caja/:id` | — | Sin body | Sin body (204) | `404` no encontrada |

## Módulo Cotización

Base: `/api/cotizacion`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/cotizacion/` | — | Sin body | `200` `{cotizacion:{id,moneda,casa,fechaActualizacion,venta}}` | `502` DolarAPI no disponible |
| GET | `/api/cotizacion/listar` | `pagina, limite` | Sin body | `200` `{cotizacion:[{id,moneda,casa,fechaActualizacion,venta}], total, pagina, limite, totalPaginas}` | — |
| GET | `/api/cotizacion/:id` | — | Sin body | `200` objeto cotización (si no existe o no se envía, devuelve la última) | — |

## Módulo Categorías

Base: `/api/categorias`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/categorias/` | `pagina, limite` | Sin body | `200` `{categorias:{categorias:[{id,nombre,productos}], total, pagina, limite, totalPaginas}}` | `401` sin sesión |
| QUERY | `/api/categorias/` | — | Objeto con propiedades a comparar por igualdad exacta (ej. `{nombre:"Bebidas"}`) | `200` `{categorias:{datos:[{id,nombre,productos}], total, pagina, limite, totalPaginas}}` | `401` sin sesión |
| GET | `/api/categorias/:id` | — | Sin body | `200` `{categoria:{id,nombre,productos}}` | `404` no encontrada |
| POST | `/api/categorias/` | — | `nombre`: string (req, no vacío ni duplicado) | `201` `{categoria:{id,nombre,productos}}` | `400` nombre vacío o duplicado |
| PATCH | `/api/categorias/:id/nombre` | — | `nombre`: string (req, no vacío ni duplicado) | `201` `{categoria:{id,nombre,productos}}` | `400` nombre vacío o duplicado<br>`404` no encontrada |
| PATCH | `/api/categorias/:id/productos` | — | `productos`: string[] (req, se concatenan) | `201` `{categoria:{id,nombre,productos}}` | `404` no encontrada |
| DELETE | `/api/categorias/:id` | — | Sin body | Sin body (204) | `404` no encontrada |

## Módulo Configuración

Base: `/api/configuracion`

| Método | Endpoint | Query params | Body esperado | Respuesta | Errores |
|---|---|---|---|---|---|
| GET | `/api/configuracion/` | — | Sin body | `200` `{configuracion:{sessionExpiringTime, sessionDurationMinutes, negocio:{nombre,telefono,direccion}, stock:{critico,medio}}}` | `401` sin sesión |
| GET | `/api/configuracion/stock` | — | Sin body | `200` `{stock:{critico,medio}}` | `401` sin sesión |
| GET | `/api/configuracion/sesion` | — | Sin body | `200` `{sessionExpiringTime}` | `401` sin sesión |
| GET | `/api/configuracion/negocio` | — | Sin body | `200` `{sessionExpiringTime}` (comportamiento actual del cableado) | `401` sin sesión |
| PATCH | `/api/configuracion/negocio` | — | Al menos un campo:<br>`nombre`: string (no vacío, máx. 120)<br>`telefono`: string (máx. 40)<br>`direccion`: string (máx. 200) | `200` `{configuracion:{sessionExpiringTime, sessionDurationMinutes, negocio, stock}}` | `400` campo inválido o sin datos<br>`401`/`403` sin permisos |
| PATCH | `/api/configuracion/expiracion` | — | `sessionDurationMinutes`: integer (req, `0..1440`) | `200` `{configuracion:{sessionExpiringTime, sessionDurationMinutes, negocio, stock}}` | `400` valor fuera de rango<br>`401`/`403` sin permisos |
| PATCH | `/api/configuracion/stock` | — | `critico`: integer (opt, `>=0`)<br>`medio`: integer (opt, `> critico`) (uno o ambos) | `200` `{configuracion:{...}}` | `400` valores inválidos<br>`401`/`403` sin permisos |
| PATCH | `/api/configuracion/sesion` | — | `duracionHoras`: integer (req, `1..24`) | `200` `{configuracion:{duracionHoras, duracionSesion}}` | `400` valor fuera de rango<br>`401`/`403` sin permisos |
