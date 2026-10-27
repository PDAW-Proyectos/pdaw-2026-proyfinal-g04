import { readFile, writeFile } from "node:fs/promises";
import { Factory } from "./factory.js";

export class Repository {
    #ruta;
    #entidades;
    #proximoId;
    #factory;

    constructor(ruta, factory) {
        if (!ruta) throw new TypeError('ruta no puede ser nulo');
        this.#ruta = ruta;
        this.#entidades = [];
        this.#proximoId = 1;
        this.#factory = factory;
    }

    static async inicializar(ruta, factory) {
        const repository = new Repository(ruta, factory)
        await repository.cargar();
        return repository;
    }

    buscarPorId(id) {
        return this.#entidades.find((e) => e.id === Number(id));
    }

    buscarPorPropiedad(propiedad) {
        const [key, value] = Object.entries(propiedad)[0];
        return this.#entidades.find((e) => e[key] === value);
    }

    listar() {
        return [...this.#entidades];
    }

    async crear(entidad) {
        entidad.id = this.#proximoId++;
        const entidadCreada = this.#factory(entidad);
        this.#entidades.push(entidadCreada);
        await this.#guardar();
        return this.#entidades[this.#entidades.length - 1];
    }

    async eliminar(id) {
        const entidad = this.buscarPorId(id);
        if (!entidad) {
            return false;
        }
        this.#entidades.splice(this.#entidades.indexOf(entidad), 1);
        await this.#guardar();
        return true;
    }

    async actualizar(entidad) {
        const entidadEncontrada = this.buscarPorId(entidad.id);
        const entidadIndex = this.#entidades.indexOf(entidadEncontrada)
        const entidadActualizada = this.#factory(entidad);
        Object.assign(entidadActualizada, entidad);
        this.#entidades[entidadIndex] = entidadActualizada;
        await this.#guardar();
        return this.#entidades[entidadIndex];
    }

    async #guardar() {
        const mapeo = this.#entidades.map((e) => ({ ...e, tipo: e.constructor.name }));
        await writeFile(this.#ruta, JSON.stringify(mapeo, null, 2), "utf8");
    }

    async cargar() {
        try {
            const datos = JSON.parse(await readFile(this.#ruta, "utf8"));
            this.#cargarDesdeJson(datos);
            this.#proximoId = Math.max(0, ...this.#entidades.map((e) => e.id)) + 1;
        } catch (error) {
            if (error.code !== "ENOENT") {
                throw error;
            }
        }
    }

    #cargarDesdeJson(datos) { 
        this.#entidades = datos.map((e) => this.#factory(e));
    }
}