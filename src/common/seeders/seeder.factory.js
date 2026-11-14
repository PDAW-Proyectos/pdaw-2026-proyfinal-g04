import { dependencyInjector } from "../config/app.module.js";
import { Seeder } from "./seeder.js";

export const crearSeeder = async () => {
    const usuarioRepository = await dependencyInjector.resolve("userRepository");
    const productoRepository = await dependencyInjector.resolve("productoRepository");
    const insumoRepository = await dependencyInjector.resolve("insumoRepository");
    const transaccionRepository = await dependencyInjector.resolve("transaccionRepository");
    const cotizacionRepository = await dependencyInjector.resolve("cotizacionRepository");
    const cajaRepository = await dependencyInjector.resolve("cajaRepository");
    const configuracionRepository = await dependencyInjector.resolve("configuracionRepository");

    return new Seeder({
        usuarioRepository,
        productoRepository,
        insumoRepository,
        transaccionRepository,
        cotizacionRepository,
        cajaRepository,
        configuracionRepository
    });
};