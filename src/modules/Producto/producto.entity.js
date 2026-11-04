export class Producto {
    constructor({ id, idCotizacion, nombre, categoria, descripcion, precioUsd }) {
        if (new.target === Producto) throw new TypeError('Producto es una clase abstracta');
        if (!id) throw new TypeError('id no puede ser nulo');
        if (precioUsd && !Number.isInteger(precioUsd) || precioUsd < 0) throw new TypeError('precioUsd debe ser un número positivo');
        this.id = id;
        this.idCotizacion = idCotizacion;
        this.nombre = nombre;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.precioUsd = precioUsd;
    }
}