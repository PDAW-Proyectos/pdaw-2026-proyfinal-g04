import { BadRequestError, NotFoundError } from "../../../common/errors/errors.classes.js";

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
            throw new NotFoundError("Ingreso");
        }

        return ingreso;
    };

    crearIngreso = async (datos) => {
        if (datos.monto < 0) throw new BadRequestError("El monto debe ser mayor o igual a cero para un ingreso");
        return await this.transaccionRepository.crear(datos);
    };

    actualizarIngreso = async (id, datos) => {
        const anterior = this.transaccionRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Ingreso");
        }
        if (datos?.monto < 0) {
            throw new BadRequestError("El monto debe ser mayor o igual a cero para un ingreso");
        }

        const datosBase = { ...anterior, ...datos };
        return await this.transaccionRepository.actualizar(datosBase);
    };

    eliminarIngreso = async (id) => {
        const eliminado = await this.transaccionRepository.eliminar(id);

        if (!eliminado) {
            throw new NotFoundError("Ingreso");
        }

        return eliminado;
    };
}