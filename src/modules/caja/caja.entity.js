import { BadRequestError, ValidationError } from "../../common/errors/errors.classes.js";

export class Caja {
    id
    usuarioAbre
    usuarioCierra
    totalEsperado
    totalContado
    diferencia
    fechaApertura
    fechaCierre
    estado
    montoInicial
    observaciones
    historialDeTransacciones

    constructor({ id, nroCaja, usuarioAbre, usuarioCierra, totalEsperado, totalContado, diferencia = 0, fechaApertura = new Date().toISOString(), fechaCierre, estado = "abierta", montoInicial = 0, observaciones = [], historialDeTransacciones = [] }) {
        if (id == null) {
            throw new ValidationError("id no puede ser nulo");
        }

        if (usuarioAbre == null) {
            throw new BadRequestError("usuarioAbre no puede ser nulo");
        }

        if (nroCaja == null) {
            throw new BadRequestError("nroCaja no puede ser nulo");
        }

        if (!["abierta", "cerrada"].includes(estado)) {
            throw new BadRequestError("El estado de la caja debe ser abierta o cerrada");
        }

        if (totalContado != null && (!Number.isFinite(totalContado) || totalContado < 0)) {
            throw new BadRequestError("totalContado debe ser un número mayor o igual a cero");
        }

        if (!Number.isFinite(diferencia)) {
            throw new BadRequestError("diferencia debe ser un número");
        }

        if (!Number.isFinite(montoInicial) || montoInicial < 0) {
            throw new BadRequestError("montoInicial debe ser un número mayor o igual a cero");
        }

        if (Number.isNaN(new Date(fechaApertura).getTime())) {
            throw new BadRequestError("fechaApertura debe ser una fecha válida");
        }

        if (fechaCierre != null && Number.isNaN(new Date(fechaCierre).getTime())) {
            throw new BadRequestError("fechaCierre debe ser una fecha válida");
        }

        if (!Array.isArray(historialDeTransacciones)) {
            throw new BadRequestError("historialDeTransacciones debe ser un array");
        }

        if (!Array.isArray(observaciones) || !observaciones.every((observacion) => typeof observacion === "string")) {
            throw new BadRequestError("observaciones debe ser un array de strings");
        }

        this.id = id;
        this.nroCaja = nroCaja;
        this.usuarioAbre = usuarioAbre;
        this.usuarioCierra = usuarioCierra ?? null;
        this.montoInicial = montoInicial;
        this.totalEsperado = totalEsperado || montoInicial;
        this.totalContado = totalContado ?? null;
        this.diferencia = diferencia;
        this.fechaApertura = fechaApertura;
        this.fechaCierre = fechaCierre ?? null;
        this.estado = estado;
        this.observaciones = observaciones;
        this.historialDeTransacciones = historialDeTransacciones;
    }
}
