import { Transaccion } from "../transaccion.entity.js";

export class Ingreso extends Transaccion {

    constructor({ id, monto, idUsuario, fecha, metodoDePago, detalleIngreso }) {
        super({ id, monto, idUsuario, fecha, metodoDePago })
        this.detalleIngreso = detalleIngreso
    }

    
}