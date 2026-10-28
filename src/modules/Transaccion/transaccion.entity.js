export class Transaccion {
    id
    monto
    idUsuario
    fecha
    metodoDePago
    articulos

    constructor({ id, monto, idUsuario, fecha, metodoDePago, articulos }) {
        if (new.target === Transaccion) throw new TypeError('Transaccion es una clase abstracta');
        if (!id) throw new TypeError('id no puede ser nulo');
        if (!Number.isInteger(monto) || monto < 0) throw new TypeError('monto debe ser un número mayor o igual a 0');
        this.id = id
        this.monto = monto
        this.idUsuario = idUsuario,
        this.fecha = fecha || new Date().toISOString()
        this.metodoDePago = metodoDePago
        this.articulos = articulos || []
    }
} 