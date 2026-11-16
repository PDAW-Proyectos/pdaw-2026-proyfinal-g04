import { Producto } from "../../../src/modules/producto/producto.entity.js";
import { ProductoPeso } from "../../../src/modules/producto/productoPeso.entity.js";
import { ProductoUnidad } from "../../../src/modules/producto/productoUnidad.entity.js";

describe("Producto", () => {
    test("al instanciar un objeto de tipo Producto devuelve una excepcion", async () => {
        expect(() => {new Producto({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100 })}).toThrow("Producto es una clase abstracta");
    });
    describe("Herencia de Producto", () => {
        test("al instanciar un objeto de tipo hijo de Producto con datos válidos no devuelve excepcion", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: 1, unidadMedida: "g" })}).not.toThrow();
        });

        test("al instanciar un objeto de tipo hijo de Producto con id nulo devuelve excepcion", async () => {
            expect(() => {new ProductoPeso({ id: null, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: 1, unidadMedida: "g" })}).toThrow("id no puede ser nulo");
        });

        test("al instanciar un objeto de tipo hijo de Producto con nombre nulo devuelve excepcion", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: null, categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: 1, unidadMedida: "g" })}).toThrow("nombre no puede ser nulo");
        });

        test("al instanciar un objeto de tipo hijo de Producto con precioUsd negativo devuelve excepcion", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: -100, peso: 1, unidadMedida: "g" })}).toThrow("precioUsd debe ser un número válido mayor o igual a 0");
        });

        test("al instanciar un objeto de tipo hijo de Producto con precioUsd que no es un numero devuelve excepcion", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: "1", peso: 1, unidadMedida: "g" })}).toThrow("precioUsd debe ser un número válido mayor o igual a 0");
        });

        test("peso en ProductoPeso no puede ser menor a 0", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: -1, unidadMedida: "g" })}).toThrow("peso no puede ser menor a 0");
        });

        test.each(["g", "kg", "l", "ml"])("unidadMedida en ProductoPeso puede ser %s", (unidadMedida) => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: 1, unidadMedida })}).not.toThrow();
        });

        test("unidadMedida en ProductoPeso no puede ser nula", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: 1, unidadMedida: null })}).toThrow("La unidad de medida debe ser una de las siguientes:0 \"g\", \"kg\", \"l\", \"ml\"");
        });
        
        test("unidadMedida en ProductoPeso no puede ser un valor inválido", async () => {
            expect(() => {new ProductoPeso({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, peso: 1, unidadMedida: "invalid" })}).toThrow("La unidad de medida debe ser una de las siguientes:0 \"g\", \"kg\", \"l\", \"ml\"");
        });

        test("unidad en ProductoUnidad no puede ser menor a 0", async () => {
            expect(() => {new ProductoUnidad({ id: 1, nombre: "Manzana", categoria: "Fruta", descripcion: "Manzana roja", precioUsd: 100, unidad: -1 })}).toThrow("unidad no puede ser menor a 0");
        });
    });
});