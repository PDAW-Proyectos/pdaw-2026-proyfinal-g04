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
            const error = new Error("insumo no encontrado");
            error.status = 404;
            throw error;
        }

        return insumo;
    }

    async crearInsumo(datos) {
        let insumoCreado;
        try {
            datos.tipo = "Insumo";
            insumoCreado = await this.insumoRepository.crear(datos);
        } catch (error) {
            error.status = 400;
            throw error;
        }
        return insumoCreado;
    }

    async actualizarInsumo(id, datos) {
        let insumoActualizado;
        const anterior = await this.insumoRepository.buscarPorId(id);
        if (!anterior) {
            const error = new Error("insumo no encontrado");
            error.status = 404;
            throw error;
        }
        
        try {
            const datosBase = { ...anterior, ...datos };
            datos.tipo = "Insumo";
            insumoActualizado = await this.insumoRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }

        return insumoActualizado;
    }

    async eliminarInsumo(id) {
        const eliminado = await this.insumoRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("insumo no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    }

    async aumentarStock(id, cantidad) {
        const insumo = await this.buscarInsumo(id);
        insumo.unidad += cantidad;
        return await this.insumoRepository.actualizar(insumo);
    }

    async disminuirStock(id, cantidad) {
        const insumo = await this.buscarInsumo(id);
        insumo.unidad -= cantidad;
        return await this.insumoRepository.actualizar(insumo);
    }
}
