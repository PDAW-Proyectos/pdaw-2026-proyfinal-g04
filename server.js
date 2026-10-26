import express from "express";
import path from "node:path";
import session from "express-session";
import { fileURLToPath } from "node:url";

import { DependencyInjector } from "./src/dependencyInjector.js";
import { Repository } from "./src/repository.js";

import crearRouterUsuarios from "./src/modules/Usuario/usuario.routes.js";
import { UserService } from "./src/modules/Usuario/usuario.service.js";
import { UserController } from "./src/modules/Usuario/usuario.controller.js";

import crearRouterAuth from "./src/modules/auth/auth.routes.js";
import { AuthService } from "./src/modules/auth/auth.service.js";
import { AuthController } from "./src/modules/auth/auth.controller.js";
import { requireAuth, allowRoles } from "./src/common/middlewares/auth.guard.js";

import crearRouterProductos from "./src/modules/Articulo/Producto/producto.routes.js";
import { ProductoService } from "./src/modules/Articulo/Producto/producto.service.js";
import { ProductoController } from "./src/modules/Articulo/Producto/producto.controller.js";

import crearRouterInsumos from "./src/modules/Articulo/Insumo/insumo.routes.js";
import { InsumoService } from "./src/modules/Articulo/Insumo/insumo.service.js";
import { InsumoController } from "./src/modules/Articulo/Insumo/insumo.controller.js";

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

dependencyInjector.registerSingleton("articulosRepository", () =>
  Repository.inicializar(path.join(__dirname, "data", "Articulos.json")),
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

dependencyInjector.registerSingleton("productoService", async () => {
  const articulosRepository = await dependencyInjector.resolve("articulosRepository");
  return new ProductoService(articulosRepository);
});

dependencyInjector.registerSingleton("productoController", async () => {
  const productoService = await dependencyInjector.resolve("productoService");
  return new ProductoController(productoService);
});

dependencyInjector.registerSingleton("insumoService", async () => {
  const articulosRepository = await dependencyInjector.resolve("articulosRepository");
  return new InsumoService(articulosRepository);
});

dependencyInjector.registerSingleton("insumoController", async () => {
  const insumoService = await dependencyInjector.resolve("insumoService");
  return new InsumoController(insumoService);
});

const userController = await dependencyInjector.resolve("userController");
const authController = await dependencyInjector.resolve("authController");
const productoController = await dependencyInjector.resolve("productoController");
const insumoController = await dependencyInjector.resolve("insumoController");

// 4. Rutas de la API
app.use("/api/usuarios", crearRouterUsuarios(userController));
app.use("/api/auth", crearRouterAuth(authController));
app.use("/api/productos", crearRouterProductos(productoController));
app.use("/api/insumos", crearRouterInsumos(insumoController));

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
