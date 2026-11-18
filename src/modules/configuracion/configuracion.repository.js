import { writeFile } from "node:fs/promises";
import { Repository } from "../../common/config/repository.js";

export class ConfiguracionRepository extends Repository {
    #configuracion

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

    set configuracion(configuracion) {
        this.#configuracion = configuracion
    }

    async actualizarConfiguracion(datos) {
        this.#configuracion = {
            ...this.#configuracion,
            ...datos,
            negocio: {
                ...this.#configuracion.negocio,
                ...datos.negocio
            },
            stock: {
                ...this.#configuracion.stock,
                ...datos.stock
            },
            cajas: datos.cajas ?? this.#configuracion.cajas
        };
        await this.guardar();
    }

	async guardar() {
		const data = {
			configuracion: this.#configuracion,
			entidades: this.entidades,
		};
		await writeFile(this.ruta, JSON.stringify(data, null, 2), "utf8");
	}

    cargarDesdeJson = (datos) => {
        this.entidades = datos.entidades ?? {};
        this.configuracion = datos.configuracion;
    };
}
