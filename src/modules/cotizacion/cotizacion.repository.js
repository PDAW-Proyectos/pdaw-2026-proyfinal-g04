import { readFile, writeFile } from "node:fs/promises";
import { Repository } from "../../common/config/repository.js";

export class CotizacionRepository extends Repository {
    #ultimaConsulta;

    constructor(ruta, factory) {
        super(ruta, factory);
    }

    static async inicializar(ruta, factory) {
        const repository = new CotizacionRepository(ruta, factory);
        await repository.cargar();
        return repository;
    }

    get ultimaConsulta() {
        return this.#ultimaConsulta;
    }

    set ultimaConsulta(fecha) {
        this.#ultimaConsulta = fecha;
    }

	async guardar() {
        console.log("cotizacion repo");
		const data = {
			ultimaConsulta: this.#ultimaConsulta,
			entidades: this.entidades,
		};
		await writeFile(this.ruta, JSON.stringify(data, null, 2), "utf8");
	}

    async cargar() {
        try {
            const datos = JSON.parse(await readFile(this.ruta, "utf8"));
            this.cargarDesdeJson(datos.entidades);
            this.#ultimaConsulta = datos?.ultimaConsulta
                ? new Date(datos.ultimaConsulta)
                : null;
            this.proximoId = Math.max(0, ...this.entidades.map((e) => e.id)) + 1;
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
    }
}
