import express from "express";
import path from "node:path";
import session from "express-session";
import { fileURLToPath } from "node:url";

import { Repository } from "./src/repository.js";
import { UserService } from "./src/modules/Usuario/usuario.service.js";
import { UserController } from "./src/modules/Usuario/usuario.controller.js";
import { InsumoService } from "./src/modules/Articulo/Insumo/insumo.service.js";
import { ProductoService } from "./src/modules/Articulo/Producto/producto.service.js";
import { DependencyInjector } from "./src/dependencyInjector.js";
import crearRouterUsuarios from "./src/modules/Usuario/usuario.routes.js";

import crearRouterAuth from "./src/modules/auth/auth.routes.js";
import { AuthService } from "./src/modules/auth/auth.service.js";
import { AuthController } from "./src/modules/auth/auth.controller.js";
import { requireAuth, allowRoles } from "./src/common/middlewares/auth.guard.js";

import { IngresoService } from "./src/modules/Transaccion/Ingreso/ingreso.service.js";
import { IngresoController } from "./src/modules/Transaccion/Ingreso/ingreso.controller.js";
import { EgresoService } from "./src/modules/Transaccion/Egreso/egreso.service.js";
import { EgresoController } from "./src/modules/Transaccion/Egreso/egreso.controller.js";
import crearRouterIngreso from "./src/modules/Transaccion/Ingreso/ingreso.routes.js";
import crearRouterEgreso from "./src/modules/Transaccion/Egreso/egreso.routes.js";

const app = express();
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
      maxAge: 1000 * 60 * 60 * 8, // 8 horas
    },
  }),
);

// 3. Inyección de dependencias
const dependencyInjector = new DependencyInjector();

dependencyInjector.registerSingleton("userRepository", () =>
  Repository.inicializar(path.join(__dirname, "data", "Usuarios.json")),
);

dependencyInjector.registerSingleton("articuloRepository", () =>
  Repository.inicializar(path.join(__dirname, "data", "Articulos.json")),
);

dependencyInjector.registerSingleton("transaccionRepository", () =>
  Repository.inicializar(path.join(__dirname, "data", "Transaccion.json")),
);

dependencyInjector.registerSingleton("userService", async () => {
  const userRepository = await dependencyInjector.resolve("userRepository");
  return new UserService(userRepository);
});

dependencyInjector.registerSingleton("userController", async () => {
  const userService = await dependencyInjector.resolve("userService");
  return new UserController(userService);
});

dependencyInjector.registerSingleton("authService", async () => {
  const userService = await dependencyInjector.resolve("userService");
  return new AuthService(userService);
});

dependencyInjector.registerSingleton("authController", async () => {
  const authService = await dependencyInjector.resolve("authService");
  return new AuthController(authService);
});

dependencyInjector.registerSingleton("ingresoService", async () => {
  const transaccionRepository = await dependencyInjector.resolve("transaccionRepository");
  return new IngresoService(transaccionRepository);
});

dependencyInjector.registerSingleton("ingresoController", async () => {
  const ingresoService = await dependencyInjector.resolve("ingresoService");
  return new IngresoController(ingresoService);
});

dependencyInjector.registerSingleton("egresoService", async () => {
  const transaccionRepository = await dependencyInjector.resolve("transaccionRepository");
  return new EgresoService(transaccionRepository);
});

dependencyInjector.registerSingleton("egresoController", async () => {
  const egresoService = await dependencyInjector.resolve("egresoService");
  return new EgresoController(egresoService);
});

const userController = await dependencyInjector.resolve("userController");
const authController = await dependencyInjector.resolve("authController");
const egresoController = await dependencyInjector.resolve("egresoController");
const ingresoController = await dependencyInjector.resolve("ingresoController");


// 4. Rutas de la API
app.use("/api/usuarios", crearRouterUsuarios(userController));
app.use("/api/auth", crearRouterAuth(authController));
app.use("/api/egreso", crearRouterEgreso(egresoController));
app.use("/api/Ingreso", crearRouterIngreso(ingresoController));

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
app.get("/index.html", requireAuth, allowRoles("repositor"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// C. Panel general de Admin
app.get("/admin.html", requireAuth, allowRoles("admin"), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// 7. Archivos estáticos públicos (login.html, login.css, login.js, etc.)
app.use(express.static(path.join(__dirname, "public")));

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
