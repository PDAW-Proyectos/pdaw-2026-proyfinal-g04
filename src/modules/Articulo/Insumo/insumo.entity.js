export class Insumo extends Articulo {
    #uso;

    constructor({ id, nombre, categoria, descripcion, stock, uso }) {
        super({ id, nombre, categoria, descripcion, stock });
        if (!uso) throw new TypeError('uso no puede ser nulo');
        this.#uso = uso;
    }

    get uso() {
        return this.#uso;
    }
}