import { Transaccion } from "../transaccion.entity.js";

export class Egreso extends Transaccion {

    constructor({ id, monto, idUsuario, fecha, metodoDePago, detalleEgreso }) {
        super({ id, monto, idUsuario, fecha, metodoDePago })
        this.detalleEgreso = detalleEgreso
    }

    
}