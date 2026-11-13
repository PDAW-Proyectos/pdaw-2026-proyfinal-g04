import { Transaccion } from "../transaccion.entity.js";
import { BadRequestError } from "../../../common/errors/errors.classes.js";

export class Ingreso extends Transaccion {
    constructor({ id, idCaja, monto, idUsuario, fecha, metodoDePago, articulos }) {
        super({ id, idCaja, monto, idUsuario, fecha, metodoDePago, articulos })
        if(monto <= 0) throw new BadRequestError('El monto debe ser mayor a cero para un Ingreso');
    }
}