import { BadRequestError } from "../../../common/errors/errors.classes.js";
import { Transaccion } from "../transaccion.entity.js";

export class Egreso extends Transaccion {

    constructor({ id, monto, idUsuario, fecha, metodoDePago, articulos }) {
        super({ id, monto, idUsuario, fecha, metodoDePago, articulos })
        if(monto > 0) throw new BadRequestError('El monto debe ser menor o igual a cero para un egreso');
    }
}