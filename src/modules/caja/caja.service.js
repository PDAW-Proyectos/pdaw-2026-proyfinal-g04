import { BadRequestError, NotFoundError } from "../../common/errors/errors.classes.js";

export class CajaService {
    constructor(cajaRepository, ingresoService, egresoService) {
        this.cajaRepository = cajaRepository;
        this.ingresoService = ingresoService;
        this.egresoService = egresoService;
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


    registrarVenta = async (idCaja, idUsuario, datos) => {
        const caja = await this.cajaRepository.buscarPorId(Number(idCaja));

        if (!caja) {
            throw new NotFoundError("La caja no existe");
        }

        if (caja.estado !== "abierta") {
            throw new BadRequestError("No se pueden registrar ventas en una caja cerrada");
        }

        if (!Number.isFinite(datos.monto) || datos.monto <= 0) {
            throw new BadRequestError("El monto de la venta debe ser mayor a cero");
        }

        const repositorios = [
            this.ingresoService.productoService.productoRepository,
            this.ingresoService.transaccionRepository,
            this.cajaRepository
        ];

        const repositoriosUnicos = [...new Set(repositorios)];
        const iniciados = [];

        try {
            for (const repositorio of repositoriosUnicos) {
                repositorio.iniciarTransaccion();
                iniciados.push(repositorio);
            }

            const venta = await this.ingresoService.crearVenta(idUsuario, {
                ...datos,
                idCaja: caja.id
            }, { administrarTransacciones: false });

            const totalEsperado = datos.metodoDePago === "efectivo"
                ? caja.totalEsperado + venta.monto
                : caja.totalEsperado;

            const datosActualizados = {
                ...caja,
                totalEsperado,
                historialDeTransacciones: [...caja.historialDeTransacciones, venta.id]
            };

            await this.cajaRepository.actualizar(datosActualizados);

            for (const repositorio of repositoriosUnicos) {
                await repositorio.confirmarTransaccion();
            }

            return {
                id: caja.id,
                totalEsperado,
                venta,
            };
        } catch (error) {
            for (const repositorio of iniciados.reverse()) {
                await repositorio.rollback();
            }

            throw error;
        }
    };

    retirarEfectivo = async (idCaja, idUsuario, datos) => {
        const caja = await this.cajaRepository.buscarPorId(Number(idCaja));

        if (!caja) {
            throw new NotFoundError("La caja no existe");
        }

        if (caja.estado !== "abierta") {
            throw new BadRequestError("No se pueden registrar retiros en una caja cerrada");
        }

        if (datos.monto > caja.totalEsperado) {
            throw new BadRequestError("No hay suficiente efectivo en la caja para realizar el retiro");
        }

        const repositorios = [
            this.egresoService.transaccionRepository,
            this.cajaRepository
        ];

        const repositoriosUnicos = [...new Set(repositorios)];
        const iniciados = [];

        try {
            for (const repositorio of repositoriosUnicos) {
                repositorio.iniciarTransaccion();
                iniciados.push(repositorio);
            }

            const egreso = await this.egresoService.crearEgreso({
                ...datos,
                monto: -Math.abs(datos.monto),
                metodoDePago: "efectivo",
                idUsuario,
                idCaja: caja.id
            }, { administrarTransacciones: false });

            const totalEsperado = caja.totalEsperado -Math.abs(egreso.monto);

            const datosActualizados = {
                ...caja,
                totalEsperado,
                historialDeTransacciones: [...caja.historialDeTransacciones, egreso.id]
            };

            await this.cajaRepository.actualizar(datosActualizados);

            for (const repositorio of repositoriosUnicos) {
                await repositorio.confirmarTransaccion();
            }

            return {
                id: caja.id,
                totalEsperado,
                egreso
            };
        } catch (error) {
            for (const repositorio of iniciados.reverse()) {
                await repositorio.rollback();
            }

            throw error;
        }
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
