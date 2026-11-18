import { MovimientoStock } from "../../../src/modules/MovimientoStock/movimiento.stock.entity.js";

describe("MovimientoStock", () => {
  const datosEntrada = {
    idProducto: 8,
    nombreProducto: "Yerba",
    idCategoria: 2,
    nombreCategoria: "Almacén",
    tipo: "entrada",
    cantidad: 12,
    unidadMedida: "unidad",
    stockAnterior: 6,
    stockNuevo: 18,
    idUsuario: 3,
    nombreUsuario: "Ana Pérez",
  };

  it("guarda los datos de producto, categoría, usuario y la variación firmada sin motivo", () => {
    const movimiento = new MovimientoStock(datosEntrada);

    expect(movimiento).toMatchObject({
      ...datosEntrada,
      fecha: expect.any(String),
    });
    expect(movimiento).not.toHaveProperty("motivo");
  });

  it("rechaza una variación que no coincide con el stock anterior y posterior", () => {
    expect(() => new MovimientoStock({
      ...datosEntrada,
      cantidad: 10,
    })).toThrow("La variación debe coincidir con la diferencia entre stockNuevo y stockAnterior");
  });

  it("rechaza una salida con variación positiva", () => {
    expect(() => new MovimientoStock({
      ...datosEntrada,
      tipo: "salida",
    })).toThrow("El signo de la variación no coincide con el tipo de movimiento");
  });

  it("rechaza el tipo de movimiento ajuste", () => {
    expect(() => new MovimientoStock({
      ...datosEntrada,
      tipo: "ajuste",
    })).toThrow("tipo debe ser entrada, salida o eliminacion");
  });

  it("permite registrar la eliminación de un producto que ya estaba sin stock", () => {
    const movimiento = new MovimientoStock({
      ...datosEntrada,
      tipo: "eliminacion",
      cantidad: 0,
      stockAnterior: 0,
      stockNuevo: 0,
    });

    expect(movimiento.tipo).toBe("eliminacion");
    expect(movimiento.cantidad).toBe(0);
  });
});
