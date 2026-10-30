import path from "node:path";
import { fileURLToPath } from "node:url";
import { DependencyInjector } from "./dependencyInjector.js";
import { Repository } from "./repository.js";
import { Factory } from "./factory.js";
import { UserController } from "../../modules/Usuario/usuario.controller.js";
import { UserService } from "../../modules/Usuario/usuario.service.js";
import { AuthController } from "../../modules/auth/auth.controller.js";
import { AuthService } from "../../modules/auth/auth.service.js";
import { ProductoController } from "../../modules/Producto/producto.controller.js";
import { ProductoService } from "../../modules/Producto/producto.service.js";
import { InsumoController } from "../../modules/Insumo/insumo.controller.js";
import { InsumoService } from "../../modules/Insumo/insumo.service.js";
import { IngresoController } from "../../modules/Transaccion/Ingreso/ingreso.controller.js";
import { IngresoService } from "../../modules/Transaccion/Ingreso/ingreso.service.js";
import { EgresoController } from "../../modules/Transaccion/Egreso/egreso.controller.js";
import { EgresoService } from "../../modules/Transaccion/Egreso/egreso.service.js";

export const dependencyInjector = new DependencyInjector();
const factory = new Factory();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


dependencyInjector.registerSingleton("userRepository", () =>
  Repository.inicializar(path.join(__dirname, "../../../data", "Usuarios.json"), factory.crearUsuario),
);

dependencyInjector.registerSingleton("productoRepository", () =>
  Repository.inicializar(path.join(__dirname, "../../../data", "Productos.json"), factory.crearProducto),
);

dependencyInjector.registerSingleton("insumoRepository", () =>
  Repository.inicializar(path.join(__dirname, "../../../data", "Insumos.json"), factory.crearInsumo),
);

dependencyInjector.registerSingleton("transaccionRepository", () =>
  Repository.inicializar(path.join(__dirname, "../../../data", "Transaccion.json"), factory.crearTransaccion),
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
  const productoRepository = await dependencyInjector.resolve("productoRepository");
  return new ProductoService(productoRepository);
});

dependencyInjector.registerSingleton("productoController", async () => {
  const productoService = await dependencyInjector.resolve("productoService");
  return new ProductoController(productoService);
});

dependencyInjector.registerSingleton("insumoService", async () => {
  const insumoRepository = await dependencyInjector.resolve("insumoRepository");
  return new InsumoService(insumoRepository);
});

dependencyInjector.registerSingleton("insumoController", async () => {
  const insumoService = await dependencyInjector.resolve("insumoService");
  return new InsumoController(insumoService);
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