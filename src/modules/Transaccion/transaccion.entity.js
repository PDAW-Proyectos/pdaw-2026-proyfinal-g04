export class Transaccion {
    id
    monto
    usuario
    fecha
    metodoDePago

    constructor({ id, monto, usuario, fecha, metodoDePago }) {
        if (new.target === Transaccion) throw new TypeError('Transaccion es una clase abstracta');
        if (!id) throw new TypeError('id no puede ser nulo');
        if (!Number.isInteger(monto) || monto < 0) throw new TypeError('monto debe ser un número mayor o igual a 0');
        this.id = id
        this.monto = monto
        this.usuario = usuario,
        this.fecha = fecha || new Date().toISOString()
        this.metodoDePago = metodoDePago
    }
} 