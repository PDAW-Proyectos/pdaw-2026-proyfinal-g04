import { Caja } from "../../../src/modules/caja/caja.entity.js";
import { BadRequestError, ValidationError } from "../../../src/common/errors/errors.classes.js";

describe("Caja", () => {
    const datosValidosBase = {
        id: 1,
        nroCaja: 101,
        usuarioAbre: "admin@test.com"
    };

    it("crea una instancia de Caja exitosamente con los valores mínimos requeridos y asigna valores por defecto", () => {
        const caja = new Caja(datosValidosBase);

        expect(caja).toBeInstanceOf(Caja);
        expect(caja.id).toBe(1);
        expect(caja.nroCaja).toBe(101);
        expect(caja.usuarioAbre).toBe("admin@test.com");
        expect(caja.usuarioCierra).toBeNull();
        expect(caja.montoInicial).toBe(0);
        expect(caja.totalEsperado).toBe(0);
        expect(caja.totalContado).toBeNull();
        expect(caja.diferencia).toBe(0);
        expect(typeof caja.fechaApertura).toBe("string");
        expect(caja.fechaCierre).toBeNull();
        expect(caja.estado).toBe("abierta");
        expect(caja.observaciones).toEqual([]);
        expect(caja.historialDeTransacciones).toEqual([]);
    });

    it("crea una instancia de Caja con todos los campos personalizados correctamente", () => {
        const fecha = new Date().toISOString();
        const datosCompletos = {
            id: 2,
            nroCaja: 202,
            usuarioAbre: "user1@test.com",
            usuarioCierra: "user2@test.com",
            totalEsperado: 1500,
            totalContado: 1450,
            diferencia: -50,
            fechaApertura: fecha,
            fechaCierre: fecha,
            estado: "cerrada",
            montoInicial: 500,
            observaciones: ["Faltó cambio"],
            historialDeTransacciones: [{ id: 1, monto: 1000 }]
        };

        const caja = new Caja(datosCompletos);

        expect(caja.id).toBe(2);
        expect(caja.nroCaja).toBe(202);
        expect(caja.usuarioAbre).toBe("user1@test.com");
        expect(caja.usuarioCierra).toBe("user2@test.com");
        expect(caja.totalEsperado).toBe(1500);
        expect(caja.totalContado).toBe(1450);
        expect(caja.diferencia).toBe(-50);
        expect(caja.fechaApertura).toBe(fecha);
        expect(caja.fechaCierre).toBe(fecha);
        expect(caja.estado).toBe("cerrada");
        expect(caja.montoInicial).toBe(500);
        expect(caja.observaciones).toEqual(["Faltó cambio"]);
        expect(caja.historialDeTransacciones).toEqual([{ id: 1, monto: 1000 }]);
    });

    describe("Validaciones y Errores", () => {
        it("arroja ValidationError si el id es null o undefined", () => {
            expect(() => new Caja({ ...datosValidosBase, id: null })).toThrow(ValidationError);
            expect(() => new Caja({ ...datosValidosBase, id: null })).toThrow("id no puede ser nulo");
            expect(() => new Caja({ ...datosValidosBase, id: undefined })).toThrow(ValidationError);
        });

        it("arroja BadRequestError si usuarioAbre es null o undefined", () => {
            expect(() => new Caja({ ...datosValidosBase, usuarioAbre: null })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, usuarioAbre: null })).toThrow("usuarioAbre no puede ser nulo");
        });

        it("arroja BadRequestError si nroCaja es null o undefined", () => {
            expect(() => new Caja({ ...datosValidosBase, nroCaja: null })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, nroCaja: null })).toThrow("nroCaja no puede ser nulo");
        });

        it("arroja BadRequestError si el estado no es 'abierta' o 'cerrada'", () => {
            expect(() => new Caja({ ...datosValidosBase, estado: "suspendida" })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, estado: "suspendida" })).toThrow("El estado de la caja debe ser abierta o cerrada");
        });

        it.each([
            { desc: "no es un número finito (NaN)", valor: NaN },
            { desc: "no es un número finito (Infinity)", valor: Infinity },
            { desc: "es negativo", valor: -10 }
        ])("arroja BadRequestError si totalContado $desc", ({ valor }) => {
            expect(() => new Caja({ ...datosValidosBase, totalContado: valor })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, totalContado: valor })).toThrow("totalContado debe ser un número mayor o igual a cero");
        });

        it.each([
            { desc: "es NaN", valor: NaN },
            { desc: "es Infinity", valor: Infinity }
        ])("arroja BadRequestError si diferencia $desc", ({ valor }) => {
            expect(() => new Caja({ ...datosValidosBase, diferencia: valor })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, diferencia: valor })).toThrow("diferencia debe ser un número");
        });

        it.each([
            { desc: "no es finito (NaN)", valor: NaN },
            { desc: "es negativo", valor: -1 }
        ])("arroja BadRequestError si montoInicial $desc", ({ valor }) => {
            expect(() => new Caja({ ...datosValidosBase, montoInicial: valor })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, montoInicial: valor })).toThrow("montoInicial debe ser un número mayor o igual a cero");
        });

        it("arroja BadRequestError si fechaApertura no es una fecha válida", () => {
            expect(() => new Caja({ ...datosValidosBase, fechaApertura: "fecha-invalida" })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, fechaApertura: "fecha-invalida" })).toThrow("fechaApertura debe ser una fecha válida");
        });

        it("arroja BadRequestError si fechaCierre no es nula y no es una fecha válida", () => {
            expect(() => new Caja({ ...datosValidosBase, fechaCierre: "fecha-invalida" })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, fechaCierre: "fecha-invalida" })).toThrow("fechaCierre debe ser una fecha válida");
        });

        it("arroja BadRequestError si historialDeTransacciones no es un array", () => {
            expect(() => new Caja({ ...datosValidosBase, historialDeTransacciones: "no-es-array" })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, historialDeTransacciones: "no-es-array" })).toThrow("historialDeTransacciones debe ser un array");
        });

        it.each([
            { desc: "no es un array", valor: "no-es-array" },
            { desc: "contiene elementos que no son strings", valor: ["ok", 123] }
        ])("arroja BadRequestError si observaciones $desc", ({ valor }) => {
            expect(() => new Caja({ ...datosValidosBase, observaciones: valor })).toThrow(BadRequestError);
            expect(() => new Caja({ ...datosValidosBase, observaciones: valor })).toThrow("observaciones debe ser un array de strings");
        });
    });
});