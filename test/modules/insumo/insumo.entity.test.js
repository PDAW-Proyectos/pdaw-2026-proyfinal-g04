import { Insumo } from "../../../src/modules/insumo/insumo.entity.js";

describe("Insumo", () => {
    test("al crear una instancia de Insumo con id nulo devuelve una excepcion", async () => {
        expect(() => {new Insumo({ nombre: "Trapo de piso", categoria: "Limpieza", unidad: 1, uso: "Limpiar el piso" })}).toThrow("id no puede ser nulo");
    });

    test("al crear una instancia de Insumo con nombre nulo devuelve una excepcion", async () => {
        expect(() => {new Insumo({ id: 1, categoria: "Limpieza", unidad: 1, uso: "Limpiar el piso" })}).toThrow("nombre no puede ser nulo");
    });

    test("al crear una instancia de Insumo con unidad que no es un numero devuelve una excepcion", async () => {
        expect(() => {new Insumo({ id: 1, nombre: "Trapo de piso", categoria: "Limpieza", unidad: "1", uso: "Limpiar el piso" })}).toThrow("unidad debe ser un número entero mayor o igual a 0");
    });

    test("al crear una instancia de Insumo con unidad menor a 0 devuelve una excepcion", async () => {
        expect(() => {new Insumo({ id: 1, nombre: "Trapo de piso", categoria: "Limpieza", unidad: -1, uso: "Limpiar el piso" })}).toThrow("unidad debe ser un número entero mayor o igual a 0");
    });

    test("al crear una instancia de Insumo con todos los parametros correctos devuelve una instancia de Insumo", async () => {
        const insumo = new Insumo({ id: 1, nombre: "Trapo de piso", categoria: "Limpieza", unidad: 1, uso: "Limpiar el piso" });
        expect(insumo).toBeInstanceOf(Insumo);
        expect(insumo).toEqual({
            id: 1, 
            nombre: "Trapo de piso", 
            categoria: "Limpieza", 
            descripcion: "",
            unidad: 1, 
            uso: "Limpiar el piso"
        });
    });
});