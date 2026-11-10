import { coincidePropiedad } from "../../src/common/utils/repository.utils.js";

describe("coincidePropiedad", () => {
    describe("propiedades primitivas", () => {
        test("devuelve true cuando todas las propiedades coinciden", () => {
            // arrange
            const objeto = { nombre: "Juan", edad: 30 };

            // act
            const resultado = coincidePropiedad(objeto, { nombre: "Juan", edad: 30 });

            // assert
            expect(resultado).toBe(true);
        });

        test("devuelve false cuando alguna propiedad no coincide", () => {
            // arrange
            const objeto = { nombre: "Juan", edad: 30 };

            // act
            const resultado = coincidePropiedad(objeto, { nombre: "Juan", edad: 31 });

            // assert
            expect(resultado).toBe(false);
        });

        test("devuelve true con un criterio vacio", () => {
            // arrange
            const objeto = { nombre: "Juan" };

            // act
            const resultado = coincidePropiedad(objeto, {});

            // assert
            expect(resultado).toBe(true);
        });

        test("devuelve false cuando la propiedad no existe", () => {
            // arrange
            const objeto = { nombre: "Juan" };

            // act
            const resultado = coincidePropiedad(objeto, { edad: 30 });

            // asssert
            expect(resultado).toBe(false);
        });

        test("compara correctamente valores null", () => {
            const objeto = { descripcion: null };

            expect(coincidePropiedad(objeto, { descripcion: null })).toBe(true);
            expect(coincidePropiedad(objeto, { descripcion: "algo" })).toBe(false);
        });

        test("devuelve true cuando la propiedad y el criterio son undefined", () => {
            // arrange
            const objeto = {};

            // act
            const resultado = coincidePropiedad(objeto, { nombre: undefined });

            // assert
            expect(resultado).toBe(true);
        });

        test("devuelve false cuando la propiedad es undefined y el criterio tiene valor", () => {
            // arrange
            const objeto = {};

            // act
            const resultado = coincidePropiedad(objeto, { nombre: "Juan" });

            // assert
            expect(resultado).toBe(false);
        });
    });

    describe("objetos anidados", () => {
        test("coincide recursivamente con las propiedades anidadas", () => {
            const objeto = {
                direccion: {
                    ciudad: "Cordoba",
                    codigoPostal: { valor: 5000 }
                }
            };

            const resultado = coincidePropiedad(objeto, {
                direccion: {
                    ciudad: "Cordoba",
                    codigoPostal: { valor: 5000 }
                }
            });

            expect(resultado).toBe(true);
        });

        test("devuelve false cuando una propiedad anidada no coincide", () => {
            const objeto = { direccion: { ciudad: "Cordoba" } };

            const resultado = coincidePropiedad(objeto, { direccion: { ciudad: "Rosario" } });

            expect(resultado).toBe(false);
        });

        test("solo compara las propiedades anidadas incluidas en el criterio", () => {
            const objeto = { direccion: { ciudad: "Cordoba", calle: "San Martin" } };

            const resultado = coincidePropiedad(objeto, { direccion: { ciudad: "Cordoba" } });

            expect(resultado).toBe(true);
        });
    });

    describe("arrays como criterio sobre valores escalares", () => {
        test("devuelve true cuando el valor coincide con algun criterio", () => {
            const objeto = { categoria: "A" };

            const resultado = coincidePropiedad(objeto, { categoria: ["A", "B"] });

            expect(resultado).toBe(true);
        });

        test("devuelve false cuando el valor no coincide con ningun criterio", () => {
            const objeto = { categoria: "C" };

            const resultado = coincidePropiedad(objeto, { categoria: ["A", "B"] });

            expect(resultado).toBe(false);
        });

        test("devuelve false cuando la propiedad no existe", () => {
            const objeto = {};

            const resultado = coincidePropiedad(objeto, { categoria: ["A"] });

            expect(resultado).toBe(false);
        });
    });

    describe("arrays como criterio sobre propiedades array", () => {
        test("devuelve true cuando todos los criterios existen en la propiedad", () => {
            const objeto = { etiquetas: ["a", "b", "c"] };

            const resultado = coincidePropiedad(objeto, { etiquetas: ["a", "c"] });

            expect(resultado).toBe(true);
        });

        test("devuelve false cuando algun criterio no existe en la propiedad", () => {
            const objeto = { etiquetas: ["a", "b"] };

            const resultado = coincidePropiedad(objeto, { etiquetas: ["a", "z"] });

            expect(resultado).toBe(false);
        });

        test("devuelve true cuando el criterio es un array vacio y la propiedad es un array", () => {
            const objeto = { etiquetas: [] };

            const resultado = coincidePropiedad(objeto, { etiquetas: [] });

            expect(resultado).toBe(true);
        });

        test("devuelve false cuando el criterio es un array vacio y la propiedad no existe", () => {
            const objeto = {};

            const resultado = coincidePropiedad(objeto, { etiquetas: [] });

            expect(resultado).toBe(false);
        });
    });

    describe("arrays de objetos", () => {
        test("coincide cuando un objeto del array satisface el criterio", () => {
            const objeto = {
                articulos: [
                    { id: 1, tipo: "A" },
                    { id: 2, tipo: "B" }
                ]
            };

            const resultado = coincidePropiedad(objeto, {
                articulos: [{ tipo: "A" }]
            });

            expect(resultado).toBe(true);
        });

        test("coincide parcialmente con los campos del objeto criterio", () => {
            const objeto = {
                articulos: [
                    { id: 1, tipo: "A", precio: 100 },
                    { id: 2, tipo: "B", precio: 200 }
                ]
            };

            const resultado = coincidePropiedad(objeto, {
                articulos: [{ tipo: "B", precio: 200 }]
            });

            expect(resultado).toBe(true);
        });

        test("devuelve false cuando ningun objeto satisface el criterio", () => {
            const objeto = {
                articulos: [
                    { id: 1, tipo: "A" },
                    { id: 2, tipo: "B" }
                ]
            };

            const resultado = coincidePropiedad(objeto, {
                articulos: [{ tipo: "C" }]
            });

            expect(resultado).toBe(false);
        });

        test("coincide con objetos anidados dentro del array", () => {
            const objeto = {
                articulos: [
                    { id: 1, detalle: { categoria: "A" } },
                    { id: 2, detalle: { categoria: "B" } }
                ]
            };

            const resultado = coincidePropiedad(objeto, {
                articulos: [{ detalle: { categoria: "B" } }]
            });

            expect(resultado).toBe(true);
        });

        test("exige que todos los criterios del array esten presentes", () => {
            const objeto = {
                articulos: [
                    { id: 1, tipo: "A" },
                    { id: 2, tipo: "B" }
                ]
            };

            const resultado = coincidePropiedad(objeto, {
                articulos: [{ tipo: "A" }, { tipo: "C" }]
            });

            expect(resultado).toBe(false);
        });
    });

    describe("manejo de errores", () => {
        test("lanza TypeError cuando falta un objeto intermedio del criterio", () => {
            const objeto = {};

            expect(() => coincidePropiedad(objeto, { direccion: { ciudad: "Cordoba" } })).toThrow(TypeError);
        });

        test("lanza TypeError cuando el criterio es undefined", () => {
            const objeto = { nombre: "Juan" };

            expect(() => coincidePropiedad(objeto, undefined)).toThrow(TypeError);
        });

        test("lanza TypeError cuando el objeto es nulo", () => {
            expect(() => coincidePropiedad(null, { nombre: "Juan" })).toThrow(TypeError);
        });
    });
});
