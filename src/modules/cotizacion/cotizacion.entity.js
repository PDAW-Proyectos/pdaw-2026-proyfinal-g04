export class Cotizacion {
    constructor({ id, moneda, casa, fechaActualizacion, venta }) {
        this.id = id
        this.moneda = moneda;
        this.casa = casa;
        this.fechaActualizacion = new Date(fechaActualizacion);
        this.venta = venta;
    }
}