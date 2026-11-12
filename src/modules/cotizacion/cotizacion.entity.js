import { ValidationError, BadRequestError } from "../../common/errors/errors.classes.js";

export class Cotizacion {
    constructor({ id, moneda, casa, fechaActualizacion, venta }) {
        if (!id) throw new ValidationError("id no puede ser nulo");
        if (!Number.isInteger(venta) || venta <= 0) {
            throw new BadRequestError("venta debe ser un número válido mayor a 0");
        }
        this.id = id;
        this.moneda = moneda;
        this.casa = casa;
        this.fechaActualizacion = new Date(fechaActualizacion);
        this.venta = venta;
    }
}