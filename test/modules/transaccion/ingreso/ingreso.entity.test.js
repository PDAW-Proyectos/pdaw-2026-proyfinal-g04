import { Ingreso } from "../../../../src/modules/transaccion/ingreso/ingreso.entity.js";
import { BadRequestError, ValidationError } from "../../../../src/common/errors/errors.classes.js";

describe("Ingreso", () => {
    it("crea una instancia de Ingreso exitosamente cuando el monto es mayor a cero", () => {
        const ingreso = new Ingreso({ id: 1, monto: 50 });
        expect(ingreso).toBeInstanceOf(Ingreso);
        expect(ingreso.monto).toBe(50);
    });

    it("crea una instancia de Ingreso con todos los parámetros completos", () => {
        const fechaCustom = "2026-10-01T10:00:00.000Z";
        const datosCompletos = {
            id: 2,
            idCaja: 1,
            monto: 500,
            idUsuario: 5,
            fecha: fechaCustom,
            metodoDePago: "efectivo",
            articulos: [{ id: 1, cantidad: 2 }]
        };

        const ingreso = new Ingreso(datosCompletos);

        expect(ingreso.id).toBe(2);
        expect(ingreso.idCaja).toBe(1);
        expect(ingreso.monto).toBe(500);
        expect(ingreso.idUsuario).toBe(5);
        expect(ingreso.fecha).toBe(fechaCustom);
        expect(ingreso.metodoDePago).toBe("efectivo");
        expect(ingreso.articulos).toEqual([{ id: 1, cantidad: 2 }]);
    });

    describe("Validaciones y Errores", () => {
        it.each([
            { desc: "es cero", valor: 0 },
            { desc: "es negativo", valor: -50 }
        ])("arroja BadRequestError si el monto $desc", ({ valor }) => {
            expect(() => new Ingreso({ id: 1, monto: valor })).toThrow(BadRequestError);
            expect(() => new Ingreso({ id: 1, monto: valor })).toThrow("El monto debe ser mayor a cero para un Ingreso");
        });

        it("arroja BadRequestError si el monto no es un número entero (heredado de Transaccion)", () => {
            expect(() => new Ingreso({ id: 1, monto: 10.5 })).toThrow(BadRequestError);
            expect(() => new Ingreso({ id: 1, monto: 10.5 })).toThrow("monto debe ser un número entero");
        });

        it("arroja ValidationError si el id es nulo o indefinido (heredado de Transaccion)", () => {
            expect(() => new Ingreso({ id: null, monto: 100 })).toThrow(ValidationError);
            expect(() => new Ingreso({ id: null, monto: 100 })).toThrow("id no puede ser nulo");
        });
    });
});