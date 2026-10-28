import { Transaccion } from "../transaccion.entity.js";

export class Egreso extends Transaccion {

    constructor({ id, monto, idUsuario, fecha, metodoDePago, articulos }) {
        if(monto > 0) throw new Error('El monto debe ser menor o igual a cero para un egreso');
        super({ id, monto, idUsuario, fecha, metodoDePago, articulos })
    }
}