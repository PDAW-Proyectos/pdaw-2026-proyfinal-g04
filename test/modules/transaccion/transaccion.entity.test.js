import { Transaccion } from "../../../src/modules/transaccion/transaccion.entity.js";
import { ValidationError, BadRequestError } from "../../../src/common/errors/errors.classes.js";

class TransaccionConcreta extends Transaccion {}

describe("Transaccion (Clase Abstracta)", () => {
    const datosValidosBase = {
        id: 1,
        monto: 100
    };

    it("arroja TypeError si se intenta instanciar directamente la clase abstracta Transaccion", () => {
        expect(() => new Transaccion(datosValidosBase)).toThrow(TypeError);
        expect(() => new Transaccion(datosValidosBase)).toThrow("Transaccion es una clase abstracta");
    });

    it("crea una instancia correctamente a través de una subclase con valores mínimos y asigna valores por defecto", () => {
        const transaccion = new TransaccionConcreta(datosValidosBase);

        expect(transaccion).toBeInstanceOf(Transaccion);
        expect(transaccion.id).toBe(1);
        expect(transaccion.monto).toBe(100);
        expect(transaccion.idUsuario).toBeUndefined();
        expect(transaccion.idCaja).toBeUndefined();
        expect(typeof transaccion.fecha).toBe("string");
        expect(transaccion.metodoDePago).toBeUndefined();
        expect(transaccion.articulos).toEqual([]);
    });

    it("crea una instancia correctamente con todos los parámetros completos", () => {
        const fechaCustom = "2026-10-01T10:00:00.000Z";
        const datosCompletos = {
            id: 2,
            idCaja: 10,
            monto: 500,
            idUsuario: 5,
            fecha: fechaCustom,
            metodoDePago: "efectivo",
            articulos: [{ id: 1, cantidad: 2 }]
        };

        const transaccion = new TransaccionConcreta(datosCompletos);

        expect(transaccion.id).toBe(2);
        expect(transaccion.idCaja).toBe(10);
        expect(transaccion.monto).toBe(500);
        expect(transaccion.idUsuario).toBe(5);
        expect(transaccion.fecha).toBe(fechaCustom);
        expect(transaccion.metodoDePago).toBe("efectivo");
        expect(transaccion.articulos).toEqual([{ id: 1, cantidad: 2 }]);
    });

    describe("Validaciones y Errores", () => {
        it.each([
            { desc: "es nulo", valor: null },
            { desc: "es undefined", valor: undefined },
            { desc: "es un string vacío", valor: "" },
            { desc: "es cero", valor: 0 }
        ])("arroja ValidationError si el id $desc", ({ valor }) => {
            expect(() => new TransaccionConcreta({ ...datosValidosBase, id: valor })).toThrow(ValidationError);
            expect(() => new TransaccionConcreta({ ...datosValidosBase, id: valor })).toThrow("id no puede ser nulo");
        });

        it.each([
            { desc: "es un número decimal (float)", valor: 10.5 },
            { desc: "es un string", valor: "100" },
            { desc: "es undefined", valor: undefined },
            { desc: "es null", valor: null },
            { desc: "es NaN", valor: NaN }
        ])("arroja BadRequestError si el monto $desc", ({ valor }) => {
            expect(() => new TransaccionConcreta({ ...datosValidosBase, monto: valor })).toThrow(BadRequestError);
            expect(() => new TransaccionConcreta({ ...datosValidosBase, monto: valor })).toThrow("monto debe ser un número entero");
        });
    });
});