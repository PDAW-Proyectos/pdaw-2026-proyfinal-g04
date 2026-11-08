import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class InsumoService {
    constructor(insumoRepository) {
        this.insumoRepository = insumoRepository
    }

    listarInsumos(pagina, limite) {
        const { datos, ...paginacion } = this.insumoRepository.listar(pagina, limite);
        return {
            insumos: datos,
            ...paginacion
        };
    }

    filtrarInsumos = (filtros, pagina, limite) => {
        const { datos, ...paginacion } = this.insumoRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            insumos: datos,
            ...paginacion
        };
    };
    
    buscarInsumo(id) {
        const insumo = this.insumoRepository.buscarPorId(id);

        if (!insumo) {
            throw new NotFoundError("Insumo");
        }

        return insumo;
    }

    async crearInsumo(datos) {
        return await this.insumoRepository.crear(datos);
    }

    async actualizarInsumo(id, datos) {
        const anterior = await this.insumoRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Insumo");
        }

        const datosBase = { ...anterior, ...datos };
        return await this.insumoRepository.actualizar(datosBase);
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
