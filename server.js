import express from "express";
import path from "node:path";
import session from "express-session";
import { fileURLToPath } from "node:url";
import { dependencyInjector } from "./src/common/config/app.module.js";
import crearRouterAuth from "./src/modules/auth/auth.routes.js";
import { requireAuth, allowRoles } from "./src/common/middlewares/auth.guard.js";
import crearRouterUsuarios from "./src/modules/usuario/usuario.routes.js";
import crearRouterProductos from "./src/modules/producto/producto.routes.js";
import crearRouterInsumos from "./src/modules/insumo/insumo.routes.js";
import crearRouterIngreso from "./src/modules/transaccion/ingreso/ingreso.routes.js";
import crearRouterEgreso from "./src/modules/transaccion/egreso/egreso.routes.js";
import crearRouterCotizacion from "./src/modules/cotizacion/cotizacion.routes.js";
import { NotFoundError } from "./src/common/errors/errors.classes.js";
import { errorHandler } from "./src/common/middlewares/errorHandler.middleware.js";
import { crearRouterCaja } from "./src/modules/caja/caja.routes.js";
import { crearRouterConfiguracion } from "./src/modules/configuracion/configuracion.routes.js";
import { crearRouterCategorias } from "./src/modules/categorias/categorias.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configuracionRepository = await dependencyInjector.resolve("configuracionRepository");

// 1. Middlewares base
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2. Configuración de sesiones seguras (única definición)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "clave-secreta-gestor-kchin",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Mitiga robo mediante XSS
      sameSite: "lax", // Mitiga CSRF
      secure: process.env.NODE_ENV === "production",
      maxAge: configuracionRepository.configuracion.sessionExpiringTime || null,
    },
  }),
);

app.use((req, res, next) => {
  if (req.session?.cookie) {
    const duracion = configuracionRepository.configuracion.sessionExpiringTime;
    req.session.cookie.maxAge = duracion === 0 ? null : duracion;
  }
  next();
});

// 3. Inyección de dependencias
const userController = await dependencyInjector.resolve("userController");
const authController = await dependencyInjector.resolve("authController");
const cajaController = await dependencyInjector.resolve("cajaController");
const categoriasController = await dependencyInjector.resolve("categoriaController");
const configuracionController = await dependencyInjector.resolve("configuracionController");
const egresoController = await dependencyInjector.resolve("egresoController");
const ingresoController = await dependencyInjector.resolve("ingresoController");
const productoController = await dependencyInjector.resolve("productoController");
const insumoController = await dependencyInjector.resolve("insumoController");
const cotizacionController = await dependencyInjector.resolve("cotizacionController");

// 4. Rutas de la API
app.use("/api/usuarios", crearRouterUsuarios(userController));
app.use("/api/auth", crearRouterAuth(authController));
app.use("/api/caja", allowRoles("cajero"), crearRouterCaja(cajaController));
app.use("/api/categorias", requireAuth, crearRouterCategorias(categoriasController));
app.use("/api/configuracion", requireAuth(), crearRouterConfiguracion(configuracionController));
app.use("/api/egreso",  allowRoles("repositor"), crearRouterEgreso(egresoController));
app.use("/api/ingreso", allowRoles("cajero"), crearRouterIngreso(ingresoController));
app.use("/api/productos", crearRouterProductos(productoController));
app.use("/api/insumos", crearRouterInsumos(insumoController));
app.use("/api/cotizacion", requireAuth, allowRoles("admin"), crearRouterCotizacion(cotizacionController));

// 5. Redirección de la raíz
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// 6. Protección de caja.html (solo cajero y admin)
// A. Caja: Solo pueden entrar Cajero y Admin
app.get("/caja.html", requireAuth, allowRoles("cajero"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "caja.html"));
});

// B. Reposición / Inventario: Solo pueden entrar Repositor y Admin
app.get("/repositor.html", requireAuth, allowRoles("repositor"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "repositor.html"));
});

// C. Panel general de Admin
app.get("/admin.html", requireAuth, allowRoles("admin"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// 7. Archivos estáticos públicos (login.html, login.css, login.js, etc.)
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    const error = new NotFoundError("Ruta");
    next(error);
});

// middleware errores
app.use(errorHandler(console));

// 8. Inicialización del puerto
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT debe ser un entero entre 1 y 65535.");
}

const server = app.listen(port, () => {
  console.log(`Servidor escuchando en: http://localhost:${port}`);
});

server.on("error", (error) => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
