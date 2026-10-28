export class Producto {
    constructor({ id, nombre, categoria, descripcion, precio }) {
        if (new.target === Producto) throw new TypeError('Producto es una clase abstracta');
        if (!id) throw new TypeError('id no puede ser nulo');
        if (precio && !Number.isInteger(precio) || precio < 0) throw new TypeError('precio debe ser un número entero mayor a 0');
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.precio = precio;
    }
}