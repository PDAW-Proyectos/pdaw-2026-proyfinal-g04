export class InsumoService {
    articuloRepository;

    constructor(articuloRepository) {
        this.articuloRepository = articuloRepository
    }

    async listarInsumos() {
        return this.articuloRepository.listar();
    }

    async buscarInsumo(id) {
        const insumo = await this.articuloRepository.buscarPorId(id);

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
            insumoCreado = await this.articuloRepository.crear(datos);
        } catch (error) {
            error.status = 400;
            throw error;
        }
        return insumoCreado;
    }

    async actualizarInsumo(id, datos) {
        let insumoActualizado;
        const anterior = await this.articuloRepository.buscarPorId(id);
        if (!anterior) {
            const error = new Error("insumo no encontrado");
            error.status = 404;
            throw error;
        }
        
        try {
            const datosBase = Object.assign(anterior, datos);
            datosBase.tipo = "insumo";
            insumoActualizado = await this.articuloRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }

        return insumoActualizado;
    }

    async eliminarInsumo(id) {
        const eliminado = await this.articuloRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("insumo no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    }
}
