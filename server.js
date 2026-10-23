import express from "express";
import path from "node:path";
import session from "express-session";
import { fileURLToPath } from "node:url";
import { Repository } from "./src/repository";
import { UserService } from "./src/modules/Usuario/usuario.service.js";
import { UserController } from "./src/modules/Usuario/usuario.controller.js";
import { InsumoService } from "./src/modules/Articulo/Insumo/insumo.service.js";
import { ProductoService } from "./src/modules/Articulo/Producto/producto.service.js";
import { DependencyInjector } from "./src/dependencyInjector";
import crearRouterUsuarios from "./src/modules/Usuario/usuario.routes";

const app = express();
export const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "clave-secreta-gestor",
    resave: false,
    saveUninitialized: false,
  }),
);

const dependencyInjector = new DependencyInjector();
dependencyInjector.registerSingleton("userRepository", {factory: () => Repository.inicializar(path.join(__dirname, "data", "Usuarios.json"))});
dependencyInjector.registerSingleton("articuloRepository", {factory: () => Repository.inicializar(path.join(__dirname, "data", "Articulos.json"))});
dependencyInjector.registerTransient("userService", {
  factory: () => {
    const userRepository = dependencyInjector.resolve("userRepository");
    return new UserService(userRepository);
  }
});
dependencyInjector.registerTransient("userController", {
  factory: () => {
    const userService = dependencyInjector.resolve("userService");
    return new UserController(userService);
  }
});

const userController = dependencyInjector.resolve("userController");

// Rutas
app.use("/api/usuarios", crearRouterUsuarios(userController));


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
