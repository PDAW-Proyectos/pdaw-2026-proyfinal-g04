import { Egreso } from "../../../../src/modules/transaccion/egreso/egreso.entity.js";
import { BadRequestError, ValidationError } from "../../../../src/common/errors/errors.classes.js";

describe("Egreso", () => {
    it("crea una instancia de Egreso exitosamente cuando el monto es menor o igual a cero", () => {
        const egresoNegativo = new Egreso({ id: 1, monto: -50 });
        const egresoCero = new Egreso({ id: 2, monto: 0 });

        expect(egresoNegativo).toBeInstanceOf(Egreso);
        expect(egresoNegativo.monto).toBe(-50);
        expect(egresoCero).toBeInstanceOf(Egreso);
        expect(egresoCero.monto).toBe(0);
    });

    it("crea una instancia de Egreso con todos los parámetros completos", () => {
        const fechaCustom = "2026-10-01T10:00:00.000Z";
        const datosCompletos = {
            id: 3,
            idCaja: 1,
            monto: -250,
            idUsuario: 5,
            fecha: fechaCustom,
            metodoDePago: "efectivo",
            articulos: [{ id: 1, cantidad: 2 }]
        };

        const egreso = new Egreso(datosCompletos);

        expect(egreso.id).toBe(3);
        expect(egreso.idCaja).toBe(1);
        expect(egreso.monto).toBe(-250);
        expect(egreso.idUsuario).toBe(5);
        expect(egreso.fecha).toBe(fechaCustom);
        expect(egreso.metodoDePago).toBe("efectivo");
        expect(egreso.articulos).toEqual([{ id: 1, cantidad: 2 }]);
    });

    describe("Validaciones y Errores", () => {
        it("arroja BadRequestError si el monto es mayor a cero (positivo)", () => {
            expect(() => new Egreso({ id: 1, monto: 50 })).toThrow(BadRequestError);
            expect(() => new Egreso({ id: 1, monto: 50 })).toThrow("El monto debe ser menor o igual a cero para un egreso");
        });

        it("arroja BadRequestError si el monto no es un número entero (heredado de Transaccion)", () => {
            expect(() => new Egreso({ id: 1, monto: -10.5 })).toThrow(BadRequestError);
            expect(() => new Egreso({ id: 1, monto: -10.5 })).toThrow("monto debe ser un número entero");
        });

        it("arroja ValidationError si el id es nulo o indefinido (heredado de Transaccion)", () => {
            expect(() => new Egreso({ id: null, monto: -100 })).toThrow(ValidationError);
            expect(() => new Egreso({ id: null, monto: -100 })).toThrow("id no puede ser nulo");
        });
    });
});