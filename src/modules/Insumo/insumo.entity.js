export class Insumo {
    constructor({ id, nombre, categoria, descripcion, stock, uso }) {
        if (!id) throw new TypeError('id no puede ser nulo');
        if (!Number.isInteger(stock) || stock < 0) throw new TypeError('stock debe ser un número mayor o igual a 0');
        this.id = id;
        this.nombre = nombre;
        this.categoria = categoria;
        this.descripcion = descripcion;
        this.stock = stock;
        this.uso = uso;
    }
}