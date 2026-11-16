import { usuariosSeed } from "./data/usuarios.seed.js";
import { productosSeed } from "./data/productos.seed.js";
import { insumosSeed } from "./data/insumos.seed.js";
import { cotizacionesSeed } from "./data/cotizaciones.seed.js";
import { transaccionesSeed } from "./data/transacciones.seed.js";
import { cajasSeed } from "./data/caja.seed.js";
import { categoriasSeed } from "./data/categorias.seed.js";

export class Seeder {
    constructor({ usuarioRepository, productoRepository, categoriaRepository, insumoRepository, transaccionRepository, cotizacionRepository, cajaRepository, configuracionRepository }) {
        this.repositorios = {
            usuarioRepository,
            productoRepository,
            categoriaRepository,
            insumoRepository,
            transaccionRepository,
            cotizacionRepository,
            cajaRepository,
            configuracionRepository
        };
    }

    async ejecutar() {
        const mocks = {
            usuarioRepository: usuariosSeed,
            productoRepository: productosSeed,
            categoriaRepository: categoriasSeed,
            insumoRepository: insumosSeed,
            transaccionRepository: transaccionesSeed,
            cotizacionRepository: cotizacionesSeed,
            cajaRepository: cajasSeed,
            configuracionRepository: []
        };

        for (const [nombre, repositorio] of Object.entries(this.repositorios)) {
            repositorio.cargarDesdeJson(mocks[nombre]);
        }

        for (const repositorio of Object.values(this.repositorios)) {
            await repositorio.guardar();
        }

        for (const repositorio of Object.values(this.repositorios)) {
            await repositorio.cargar();
        }

        console.log("Seeder ejecutado correctamente.");
    }
}