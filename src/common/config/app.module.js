import path from "node:path";
import { fileURLToPath } from "node:url";
import { DependencyInjector } from "./dependencyInjector.js";
import { Repository } from "./repository.js";
import { Factory } from "./factory.js";
import { UserController } from "../../modules/usuario/usuario.controller.js";
import { UserService } from "../../modules/usuario/usuario.service.js";
import { AuthController } from "../../modules/auth/auth.controller.js";
import { AuthService } from "../../modules/auth/auth.service.js";
import { ProductoController } from "../../modules/producto/producto.controller.js";
import { ProductoService } from "../../modules/producto/producto.service.js";
import { InsumoController } from "../../modules/insumo/insumo.controller.js";
import { InsumoService } from "../../modules/insumo/insumo.service.js";
import { IngresoController } from "../../modules/transaccion/ingreso/ingreso.controller.js";
import { IngresoService } from "../../modules/transaccion/ingreso/ingreso.service.js";
import { EgresoController } from "../../modules/transaccion/egreso/egreso.controller.js";
import { EgresoService } from "../../modules/transaccion/egreso/egreso.service.js";
import { CotizacionController } from "../../modules/cotizacion/cotizacion.controller.js";
import { CotizacionService } from "../../modules/cotizacion/cotizacion.service.js";
import { CotizacionRepository } from "../../modules/cotizacion/cotizacion.repository.js";
import { CajaService } from "../../modules/caja/caja.service.js";
import { CajaController } from "../../modules/caja/caja.controller.js";

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
  Repository.inicializar(path.join(__dirname, "../../../data", "Transacciones.json"), factory.crearTransaccion),
);

dependencyInjector.registerSingleton("cotizacionRepository", () =>
  CotizacionRepository.inicializar(path.join(__dirname, "../../../data", "Cotizaciones.json"), factory.crearCotizacion),
);

dependencyInjector.registerSingleton("cajaRepository", () =>
  Repository.inicializar(path.join(__dirname, "../../../data", "Caja.json"), factory.crearCaja),
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
  const cotizacionService = await dependencyInjector.resolve("cotizacionService");
  return new ProductoService(productoRepository, cotizacionService);
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
  const productoService = await dependencyInjector.resolve("productoService");
  return new IngresoService(transaccionRepository, productoService);
});

dependencyInjector.registerSingleton("ingresoController", async () => {
  const ingresoService = await dependencyInjector.resolve("ingresoService");
  return new IngresoController(ingresoService);
});

dependencyInjector.registerSingleton("egresoService", async () => {
  const transaccionRepository = await dependencyInjector.resolve("transaccionRepository");
  const productoService = await dependencyInjector.resolve("productoService");
  const insumoService = await dependencyInjector.resolve("insumoService");
  return new EgresoService(transaccionRepository, productoService, insumoService);
});

dependencyInjector.registerSingleton("egresoController", async () => {
  const egresoService = await dependencyInjector.resolve("egresoService");
  return new EgresoController(egresoService);
});

dependencyInjector.registerSingleton("cotizacionService", async () => {
  const cotizacionRepository = await dependencyInjector.resolve("cotizacionRepository");
  return new CotizacionService(cotizacionRepository);
});

dependencyInjector.registerSingleton("cotizacionController", async () => {
  const cotizacionService = await dependencyInjector.resolve("cotizacionService");
  return new CotizacionController(cotizacionService);
});

dependencyInjector.registerSingleton("cajaService", async () => {
  const cajaRepository = await dependencyInjector.resolve("cajaRepository");
  const ingresoService = await dependencyInjector.resolve("ingresoService");
  const egresoService = await dependencyInjector.resolve("egresoService");
  return new CajaService(cajaRepository, ingresoService, egresoService);
});

dependencyInjector.registerSingleton("cajaController", async () => {
  const cajaService = await dependencyInjector.resolve("cajaService");
  return new CajaController(cajaService);
});