import { readFile, writeFile } from "node:fs/promises";
import { Repository } from "../../common/config/repository.js";

export class ConfiguracionRepository extends Repository {
    #configuracion;

    constructor(ruta, factory) {
        super(ruta, factory);
    }

    static async inicializar(ruta, factory) {
        const repository = new ConfiguracionRepository(ruta, factory);
        await repository.cargar();
        return repository;
    }

    get configuracion() {
        return this.#configuracion;
    }

    async actualizarConfiguracion(datos) {
        this.#configuracion = {
            ...this.#configuracion,
            ...datos
        };
        await this.guardar()
    }

	async guardar() {
		const data = {
			configuracion: this.#configuracion,
			entidades: this.entidades,
		};
		await writeFile(this.ruta, JSON.stringify(data, null, 2), "utf8");
	}

    async cargar() {
        try {
            const datos = JSON.parse(await readFile(this.ruta, "utf8"));
            this.cargarDesdeJson(datos.entidades);
            this.#configuracion = datos?.configuracion ? datos.configuracion : { sessionExpiringTime: 28800000 };
            this.proximoId = Math.max(0, ...this.entidades.map((e) => e.id)) + 1;
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
    }
}
