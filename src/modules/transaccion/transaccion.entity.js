import { ValidationError, BadRequestError } from "../../common/errors/errors.classes.js";

export class Transaccion {
    id
    monto
    idUsuario
    fecha
    metodoDePago
    articulos

    constructor({ id, idCaja, monto, idUsuario, fecha, metodoDePago, articulos }) {
        if (new.target === Transaccion) throw new TypeError("Transaccion es una clase abstracta");
        if (!id) throw new ValidationError("id no puede ser nulo");
        if (!Number.isFinite(monto)) throw new BadRequestError('monto debe ser un número finito');
        this.id = id
        this.idUsuario = idUsuario
        this.idCaja = idCaja
        this.monto = monto
        this.fecha = fecha || new Date().toISOString()
        this.metodoDePago = metodoDePago
        this.articulos = articulos || []
    }
}