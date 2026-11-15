import { NotFoundError } from "../../common/errors/errors.classes.js";

export class TransaccionesService {
    constructor(transaccionRepository) {
        this.transaccionRepository = transaccionRepository;
    }

    listarTransacciones = (pagina, limite) => {
        const { datos, ...paginacion } = this.transaccionRepository.listar(pagina, limite);

        return {
            transacciones: datos,
            ...paginacion
        };
    };

    filtrarTransacciones = (filtros, pagina, limite) => {
        const { datos, ...paginacion } = this.transaccionRepository.listarPorPropiedades(
            filtros,
            pagina,
            limite
        );

        return {
            transacciones: datos,
            ...paginacion
        };
    };

    buscarTransaccion = (id) => {
        const transaccion = this.transaccionRepository.buscarPorId(id);

        if (!transaccion) {
            throw new NotFoundError("Transacción");
        }

        return transaccion;
    };
}