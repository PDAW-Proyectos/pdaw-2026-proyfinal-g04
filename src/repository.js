import { readFile, writeFile } from "node:fs/promises";
import { Factory } from "./factory.js";

export class Repository {
    #ruta;
    #entidades;
    #proximoId;
    #factory;

    constructor(ruta) {
        if (!ruta) throw new TypeError('ruta no puede ser nulo');
        this.#ruta = ruta;
        this.#entidades = [];
        this.#proximoId = 1;
        this.#factory = new Factory();
    }

    static async inicializar(ruta) {
        const repository = new Repository(ruta)
        await repository.#cargar();
        return repository;
    }

    buscarPorId(id) {
        return this.#entidades.find((e) => e.id === Number(id));
    }

    listar() {
        return [...this.#entidades];
    }

    async crear(entidad) {
        entidad.id = this.proximoId++;
        this.entidades.push(entidad);
        await this.guardar();
        return this.#entidades[this.#entidades.length - 1];
    }

    async eliminar(id) {
        const entidad = this.buscarPorId(id);
        if (!entidad) {
            return false;
        }
        this.#entidades.splice(this.#entidades.indexOf(entidad), 1);
        await this.guardar();
        return true;
    }

    async actualizar(entidad) {
            const entidadIndex = this.#entidades.indexOf(entidad);
            this.#entidades[entidadIndex] = entidad;
            await this.guardar();
            return this.#entidades[entidadIndex];
        }

    async guardar() {
        await writeFile(this.#ruta, JSON.stringify(this.#entidades, null, 2), "utf8");
    }

    async #cargar() {
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
        this.#entidades = datos.map((e) => this.#factory.crear(e));
    }
}