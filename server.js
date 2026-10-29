import express from "express";
import path from "node:path";
import session from "express-session";
import { fileURLToPath } from "node:url";
import { dependencyInjector } from "./src/common/config/app.module.js";
import crearRouterAuth from "./src/modules/auth/auth.routes.js";
import { requireAuth, allowRoles } from "./src/common/middlewares/auth.guard.js";
import crearRouterUsuarios from "./src/modules/Usuario/usuario.routes.js";
import crearRouterProductos from "./src/modules/Producto/producto.routes.js";
import crearRouterInsumos from "./src/modules/Insumo/insumo.routes.js";
import crearRouterIngreso from "./src/modules/Transaccion/Ingreso/ingreso.routes.js";
import crearRouterEgreso from "./src/modules/Transaccion/Egreso/egreso.routes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const userController = await dependencyInjector.resolve("userController");
const authController = await dependencyInjector.resolve("authController");
const egresoController = await dependencyInjector.resolve("egresoController");
const ingresoController = await dependencyInjector.resolve("ingresoController");
const productoController = await dependencyInjector.resolve("productoController");
const insumoController = await dependencyInjector.resolve("insumoController");

// 4. Rutas de la API
app.use("/api/usuarios", crearRouterUsuarios(userController));
app.use("/api/auth", crearRouterAuth(authController));
app.use("/api/egreso",  allowRoles("repositor"), crearRouterEgreso(egresoController));
app.use("/api/ingreso", allowRoles("cajero"), crearRouterIngreso(ingresoController));
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
