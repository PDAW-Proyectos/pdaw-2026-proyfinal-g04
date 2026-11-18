import { MovimientoStockService } from "../../../src/modules/MovimientoStock/movimiento.stock.service.js";

describe("MovimientoStockService", () => {
  it("devuelve primero los movimientos más recientes y pagina después de ordenar", () => {
    const repository = {
      listar: () => ({
        datos: [
          { id: 1, fecha: "2026-11-17T10:00:00.000Z", tipo: "entrada" },
          { id: 2, fecha: "2026-11-17T12:00:00.000Z", tipo: "eliminacion" },
          { id: 3, fecha: "2026-11-17T11:00:00.000Z", tipo: "salida" },
        ],
      }),
    };
    const service = new MovimientoStockService(repository);

    const resultado = service.listarMovimientos(1, 2);

    expect(resultado.datos.map(({ id }) => id)).toEqual([2, 3]);
    expect(resultado).toMatchObject({
      total: 3,
      pagina: 1,
      limite: 2,
      totalPaginas: 2,
    });
  });

  it("aplica filtros antes de paginar", () => {
    const repository = {
      listar: () => ({
        datos: [
          { id: 1, fecha: "2026-11-17T10:00:00.000Z", tipo: "entrada", nombreProducto: "Yerba" },
          { id: 2, fecha: "2026-11-17T12:00:00.000Z", tipo: "eliminacion", nombreProducto: "Leche" },
        ],
      }),
    };
    const service = new MovimientoStockService(repository);

    const resultado = service.listarMovimientos(1, 10, { nombreProducto: "yer" });

    expect(resultado.datos.map(({ id }) => id)).toEqual([1]);
    expect(resultado.total).toBe(1);
  });

});
