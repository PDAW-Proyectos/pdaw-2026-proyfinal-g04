import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class CajaService {
    constructor(cajaRepository, userService) {
        this.cajaRepository = cajaRepository;
        this.userService = userService
    }

    listarCajas = (pagina, limite) => {
        const { datos, ...paginacion } = this.cajaRepository.listar(pagina, limite);
        return {
            cajas: datos,
            ...paginacion
        };
    };

    filtrarCajas = (filtros, pagina, limite) => {
        const { datos, ...paginacion } = this.cajaRepository.listarPorPropiedades(filtros, pagina, limite);
        return {
            cajas: datos,
            ...paginacion
        };
    };

    buscarCaja = (id) => {
        const caja = this.cajaRepository.buscarPorId(id);

        if (!caja) {
            throw new NotFoundError("Caja");
        }

        return caja;
    };

    crearCaja = async (datos) => {
        return await this.cajaRepository.crear(datos);
    };

    actualizarCaja = async (id, datos) => {
        const anterior = this.cajaRepository.buscarPorId(id);

        if (!anterior) {
            throw new NotFoundError("Caja");
        }

        const datosBase = { ...anterior, ...datos };
        return await this.cajaRepository.actualizar(datosBase);
    };

    cerrarCaja = async (id, datos, usuarioCierra) => {
        const caja = this.cajaRepository.buscarPorId(id);

        if (!caja) {
            throw new NotFoundError("Caja");
        }

        if (caja.estado !== "abierta") {
            throw new BadRequestError("La caja ya se encuentra cerrada");
        }

        if (!Number.isFinite(datos.totalContado) || datos.totalContado < 0) {
            throw new BadRequestError("totalContado debe ser un número mayor o igual a cero");
        }

        const observaciones = datos.observaciones ?? [];

        const datosActualizados = {
            ...caja,
            usuarioCierra,
            totalContado: datos.totalContado,
            diferencia: datos.totalContado - caja.totalEsperado,
            fechaCierre: new Date().toISOString(),
            estado: "cerrada",
            observaciones: [...caja.observaciones, ...observaciones]
        };

        return await this.cajaRepository.actualizar(datosActualizados);
    };

    eliminarCaja = async (id) => {
        const eliminada = await this.cajaRepository.eliminar(id);

        if (!eliminada) {
            throw new NotFoundError("Caja");
        }

        return eliminada;
    };
}
