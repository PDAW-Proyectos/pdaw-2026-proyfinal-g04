import { Transaccion } from "../transaccion.entity.js";

export class Ingreso extends Transaccion {

    constructor({ id, monto, idUsuario, fecha, metodoDePago, articulos }) {
        if(monto <= 0) throw new Error('El monto debe ser mayor a cero para un Ingreso');
        super({ id, monto, idUsuario, fecha, metodoDePago, articulos })
    }
}