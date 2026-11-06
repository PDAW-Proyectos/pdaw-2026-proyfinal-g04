import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class InsumoService {
    constructor(insumoRepository) {
        this.insumoRepository = insumoRepository
    }

    async listarInsumos(pagina, limite) {
        const { datos, ...paginacion } = this.insumoRepository.listar(pagina, limite);
        return {
            insumos: datos,
            ...paginacion
        };
    }

    filtrarInsumos = async (filtros, pagina, limite) => {
        const { datos, ...paginacion } = await this.insumoRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            insumos: datos,
            ...paginacion
        };
    };

    async buscarInsumo(id) {
        const insumo = await this.insumoRepository.buscarPorId(id);

        if (!insumo) {
            throw new NotFoundError("Insumo");
        }

        return insumo;
    }

    async crearInsumo(datos) {
        try {
            return await this.insumoRepository.crear(datos);
        } catch (error) {
            if (error instanceof TypeError) {
                throw new BadRequestError(error.message);
            }
            throw error;
        }
    }

    async actualizarInsumo(id, datos) {
        const anterior = await this.insumoRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Insumo");
        }

        try {
            const datosBase = { ...anterior, ...datos };
            return await this.insumoRepository.actualizar(datosBase);
        } catch (error) {
            if (error instanceof TypeError) {
                throw new BadRequestError(error.message);
            }
            throw error;
        }
    }

    async eliminarInsumo(id) {
        const eliminado = await this.insumoRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Insumo");
        }

        return eliminado;
    }

    async aumentarStock(id, cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new BadRequestError("La cantidad debe ser un número entero positivo");
        }

        const insumo = await this.buscarInsumo(id);
        insumo.unidad += cantidad;
        return await this.insumoRepository.actualizar(insumo);
    }

    async disminuirStock(id, cantidad) {
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new BadRequestError("La cantidad debe ser un número entero positivo");
        }

        const insumo = await this.buscarInsumo(id);

        if (insumo.unidad < cantidad) {
            throw new BadRequestError("Stock insuficiente");
        }

        insumo.unidad -= cantidad;
        return await this.insumoRepository.actualizar(insumo);
    }
}
