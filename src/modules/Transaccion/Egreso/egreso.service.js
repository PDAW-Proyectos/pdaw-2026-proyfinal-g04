export class EgresoService {
    transaccionRepository;

    constructor(transaccionRepository) {
        this.transaccionRepository = transaccionRepository;
    }

    listarEgresos = async () => {
        return await this.transaccionRepository.listar();
    };

    buscarEgreso = async (id) => {
        const egreso = await this.transaccionRepository.buscarPorId(id);

        if (!egreso) {
            const error = new Error("Egreso no encontrado");
            error.status = 404;
            throw error;
        }

        return egreso;
    };

    crearEgreso = async (datos) => {
        return await this.transaccionRepository.crear(datos);
    };

    actualizarEgreso = async (id, datos) => {
        const anterior = await this.transaccionRepository.buscarPorId(id);

        if (!anterior) {
            const error = new Error("Egreso no encontrado");
            error.status = 404;
            throw error;
        }

        try {
            const datosBase = Object.assign(anterior, datos);
            return await this.transaccionRepository.actualizar(datosBase);
        } catch (error) {
            error.status = 400;
            throw error;
        }
    };

    eliminarEgreso = async (id) => {
        const eliminado = await this.transaccionRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("Egreso no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    };
}