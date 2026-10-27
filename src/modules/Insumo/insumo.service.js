export class InsumoService {
    insumoRepository;

    constructor(insumoRepository) {
        this.insumoRepository = insumoRepository
    }

    async listarInsumos() {
        return this.insumoRepository.listar();
    }

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
            const datosBase = Object.assign(anterior, datos);
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
}
