export class IngresoService {
    transaccionRepository;

    constructor(transaccionRepository) {
        this.transaccionRepository = transaccionRepository;
    }

    listarIngresos = async (pagina, limite) => {
        const { datos, ...paginacion } = await this.transaccionRepository.listar(pagina, limite);
        return {
            ingresos: datos,
            ...paginacion
        };
    };

    filtrarIngresos = async (filtros, pagina, limite) => {
        const { datos, ...paginacion } = await this.transaccionRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            ingresos: datos,
            ...paginacion
        };
    };

    buscarIngreso = async (id) => {
        const ingreso = await this.transaccionRepository.buscarPorId(id);

        if (!ingreso) {
            const error = new Error("Ingreso no encontrado");
            error.status = 404;
            throw error;
        }

        return ingreso;
    };

    crearIngreso = async (datos) => {
        return await this.transaccionRepository.crear(datos);
    };

    actualizarIngreso = async (id, datos) => {
        const anterior = await this.transaccionRepository.buscarPorId(id);

        if (!anterior) {
            const error = new Error("Ingreso no encontrado");
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

    eliminarIngreso = async (id) => {
        const eliminado = await this.transaccionRepository.eliminar(id);

        if (!eliminado) {
            const error = new Error("Ingreso no encontrado");
            error.status = 404;
            throw error;
        }

        return eliminado;
    };
}