# Arquitectura — KCHIN

## Descripción general

Backend Node.js/Express 5 (ESM) del gestor de caja comercial KCHIN.

- Funcionalidades: apertura/arqueo/cierre de caja, ventas, compras, stock de productos e insumos, actualización de precios vía DolarAPI, usuarios y roles, configuración del negocio.
- Tecnologías: Node.js, Express 5, express-session, bcrypt, persistencia en archivos JSON, Jest, ESLint.

## Arquitectura

Flujo de una petición: `routes → controller → service → repository → data/*.json`.

Estructura de carpetas: Screaming architecture

```
src/
├── common/         # Por fuera del dominio de los modulo, o compartido entre modulos
│   ├── config/          # DI, Factory, Repository base, app.module
│   ├── errors/          # AppError y derivados
│   ├── middlewares/     # auth.guard, errorHandler
│   ├── seeders/         # datos de prueba
│   └── utils/           # paginación y comparación de propiedades
└── modules/
    └── <modulo>    # Agrupaciones funcionales por entidad
        ├── *.routes.js       # endpoints y middlewares
        ├── *.controller.js   # HTTP <-> servicio
        ├── *.service.js      # reglas de negocio
        ├── *.entity.js       # validación y modelo de dominio
        └── *.repository.js   # persistencia especial (cuando aplica)
data/*.json                  # persistencia (raíz del proyecto)
```

Módulos: auth, usuario, producto, insumo, transaccion (ingreso/egreso), caja, cotizacion, categoria, configuracion.

Rutas web (HTML) expuestas por `server.js`: `GET /` (redirige a `/login.html`), `/login.html` (público), `/caja.html` (cajero/admin), `/repositor.html` (repositor/admin), `/admin.html` (admin), estáticos de `public/`, `404` Problem Details para rutas inexistentes.

## Inyección de dependencias

`DependencyInjector` (`src/common/config/dependencyInjector.js`):

- `registerSingleton(token, factory)`: instancia única (cachea la promesa).
- `registerTransient(token, factory)`: instancia nueva en cada `resolve`.
- `resolve(token)`: resolución asíncrona.

Todo el grafo se registra en `src/common/config/app.module.js`: repositorios → servicios → controladores. Los repositorios son singletons que cargan su JSON al inicializarse. `server.js` resuelve cada controlador y lo pasa a `crearRouter...`; el Seeder resuelve repositorios igual.

## Factory y Repository

`Factory` (`src/common/config/factory.js`) convierte JSON en entidades con validación:

- `crearUsuario` → `Usuario`
- `crearProducto` → `ProductoUnidad` (si tiene `unidad`) o `ProductoPeso` (si tiene `peso`)
- `crearInsumo` → `Insumo`
- `crearTransaccion` → `Ingreso` si `monto > 0`, `Egreso` si `monto <= 0`
- `crearCotizacion` → `Cotizacion`
- `crearCaja` → `Caja`
- `crearCategoria` → `Categoria`
- `crearConfiguracion` → objeto tal cual (sin entidad)

El Repository base usa la factory al cargar/crear/actualizar, aplicando validaciones en cada operación. Persistencia en archivos JSON con transacciones en memoria: `iniciarTransaccion`, `confirmarTransaccion`, `rollback`.

## Autenticación y autorización

- Sesiones con cookie `connect.sid` (`httpOnly`, `sameSite: lax`, `secure` en producción). `POST /api/auth/login` regenera sesión y guarda `userId` y `role`.
- Middlewares `requireAuth` y `allowRoles(...)`. Roles: `admin`, `repositor`, `cajero`. `admin` siempre tiene acceso; el resto debe coincidir.
- Duración de sesión tomada de `Configuracion.sessionExpiringTime` (default 8h); si es `0`, dura la sesión del navegador.
- Sin sesión en API: `401 {error:"Es necesario iniciar sesión"}`; en HTML: redirección a `/login.html`. Rol no permitido en API: `403 {error:"Acceso denegado"}`; en HTML: `403` con `public/accesoDenegado.html`.

## Reglas de negocio

- Productos por unidad (`unidad`, stock entero) y por peso (`peso`, `unidadMedida`: `g`, `kg`, `l`, `ml`).
- Ingreso: `monto > 0`; egreso: `monto <= 0`.
- Ventas (`/api/ingreso/venta`, `/api/caja/:id/venta`): descuentan stock, crean ingreso, transacción con rollback.
- Compras (`/api/egreso/compra`): aumentan stock o crean artículos nuevos, generan egreso, transacción con rollback.
- Caja: apertura con `montoInicial`; ventas en efectivo suman a `totalEsperado`; retiros descuentan; cierre calcula `diferencia = totalContado - totalEsperado` y pasa a `cerrada`.
- Cotización: dólar blue desde DolarAPI; consulta externa solo si pasaron >3h y hora UTC entre 14 y 20; si no, devuelve la última guardada.
- Configuración: `sessionExpiringTime`, datos del negocio y umbrales de stock (`critico`, `medio`).

## Manejo de errores

Clases de error (`src/common/errors/`): `AppError` y derivados (`BadRequestError` 400, etc.). Respuestas en formato Problem Details (RFC 7807), `Content-Type: application/problem+json`, con `title`, `status`, `detail`, `instance`, `requestId`. Códigos: 400 datos inválidos/regla de negocio, 401 no autenticado/credenciales, 403 sin permisos, 404 recurso/ruta inexistente, 409 conflicto, 500 error interno, 502 servicio externo. JSON no parseable → `400 "El JSON enviado no es válido"`. Ruta no registrada → `404 "Ruta no encontrado"`.

## Persistencia y Seeder

- Almacenamiento en `data/*.json`. Repositorios cargan su archivo al inicializarse.
- `npm run seed` ejecuta `src/common/seeders/index.js`: resuelve repositorios, carga mocks de `src/common/seeders/data/` (usuarios, productos, insumos, transacciones, cotizaciones, caja), por cada repositorio `cargarDesdeJson` → `guardar` → `cargar`. Sobrescribe los JSON de `data/`.
- No incluye seed de categorías; configuración con valores por defecto.
- Incluye usuarios de prueba con roles `admin`, `repositor`, `cajero` (`admin@kchin.com`, `repositor@kchin.com`, `cajero@kchin.com`) y un usuario deshabilitado.

## Notas de implementación

- Paginación: listados aceptan `pagina` (default 1, >=1) y `limite` (default 10, 1..50); respuesta incluye `total`, `pagina`, `limite`, `totalPaginas`. Si `pagina`/`limite` inválidos se lanza `Error` genérico → `500` (no 400).
- Filtros usan método HTTP `QUERY` (`router.query(...)`), mismo path que el listado, body con propiedades a comparar por igualdad exacta (`coincidePropiedad`, comparación recursiva/contención para objetos/arrays).
- Productos guardan `idCotizacion`, pero listado/búsqueda lo reemplazan por cotización de venta actual; QUERY no incluye `cotizacion`/`cotizacionFecha`.
- `POST /api/productos/` ignora `idCotizacion` enviado y usa la cotización vigente.
- `PUT /api/productos/actualizar-precios`: el controlador llama a `actualizarPreciosMasivo(tipo, valor)` pero el servicio espera un array de productos; la operación no actualiza precios y `modificados` puede ser `undefined`.
- Usuarios (`/api/usuarios`) e insumos (`/api/insumos`) montados sin autenticación (públicos).
- Categorías: respuesta anidada doble (listado y filtro); `GET /:id` envuelve en `{categoria}`; `POST`/`PATCH` responden `201`.
- Configuración: `GET /negocio` apunta por error a `obtenerSesion` (devuelve `{sessionExpiringTime}`); `PATCH` solo admin.
- `POST /api/caja/`: `usuarioAbre` se toma de `req.session.userId`, no del body.
- Autenticación actual no valida el campo `habilitado` del usuario.
- Limitaciones conocidas documentadas arriba son comportamiento real de la implementación.
