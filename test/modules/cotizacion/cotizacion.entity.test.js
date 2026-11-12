import { Cotizacion } from "../../../src/modules/cotizacion/cotizacion.entity.js";

describe("Cotizacion", () => {
    it("al crear una instancia de cotizacion con id nulo o sin id devuelve excepcion", async () => {
        expect(() => {new Cotizacion({ id: null, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: 1500 });}).toThrow("id no puede ser nulo");
        expect(() => {new Cotizacion({ moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: 1500 });}).toThrow("id no puede ser nulo");
    });

    it("al crear una instancia de cotizacion con venta nulo o sin venta devuelve excepcion", async () => {
        expect(() => {new Cotizacion({ id: 1, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026" });}).toThrow("venta debe ser un número válido mayor a 0");
        expect(() => {new Cotizacion({ id: 1, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: null });}).toThrow("venta debe ser un número válido mayor a 0");
    });

    it("al crear una instancia de cotizacion con un valor de venta distinto a integer devuelve excepcion", async () => {
        expect(() => {new Cotizacion({ id: 1, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: "a" });}).toThrow("venta debe ser un número válido mayor a 0");
    });

    it("al crear una instancia de cotizacion con un valor de venta menor o igual a 0 devuelve excepcion", async () => {
        expect(() => {new Cotizacion({ id: 1, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: 0 });}).toThrow("venta debe ser un número válido mayor a 0");
        expect(() => {new Cotizacion({ id: 1, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: -1 });}).toThrow("venta debe ser un número válido mayor a 0");
    });

    it("al crear una instancia de cotizacion con todos los parametros correctos devuelve una instancia de cotizacion", async () => {
        const cotizacion = new Cotizacion({ id: 1, moneda: "USD", casa: "blue", fechaActualizacion: "10/01/2026", venta: 1560 });
        expect(cotizacion).toBeInstanceOf(Cotizacion);
        expect(cotizacion).toEqual({ 
            id: 1, 
            moneda: "USD", 
            casa: "blue", 
            fechaActualizacion: new Date("10/01/2026"), 
            venta: 1560 
        });
    });
});
