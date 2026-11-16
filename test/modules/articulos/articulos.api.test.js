import { jest } from "@jest/globals";
import { crearArticulosApi } from "../../../public/modules/Articulos/articulos.api.js";

describe("crearArticulosApi", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("carga y adapta productos del backend al formato del inventario", async () => {
        jest.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
            if (String(url).includes("/productos/")) {
                return {
                    ok: true,
                    status: 200,
                    json: async () => ({
                        productos: [{
                            id: 8,
                            idCategoria: 2,
                            nombre: "Producto",
                            descripcion: "Descripción",
                            precioUsd: 2,
                            cotizacion: 1000,
                            unidad: 4,
                        }],
                        totalPaginas: 1,
                    }),
                };
            }

            return {
                ok: true,
                status: 200,
                json: async () => ({
                    categorias: {
                        categorias: [{ id: 2, nombre: "Almacén" }],
                    },
                }),
            };
        });

        const productos = await crearArticulosApi().listarProductos();

        expect(productos[0]).toMatchObject({
            id: 8,
            categoria: "Almacén",
            precio: 2000,
            stock: 4,
        });
    });

    it("rechaza productos sin precio", async () => {
        jest.spyOn(globalThis, "fetch").mockImplementation(async (url) => ({
            ok: true,
            status: 200,
            json: async () => String(url).includes("/productos/")
                ? { productos: [{ id: 10, nombre: "Sin precio" }], totalPaginas: 1 }
                : { categorias: { categorias: [] } },
        }));

        await expect(crearArticulosApi().listarProductos()).rejects.toThrow("no tiene un precio USD válido");
    });

    it("actualiza la cantidad en el campo de stock correspondiente al tipo de producto", async () => {
        const fetch = jest.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ id: 9, nombre: "Producto", peso: 3.5, precioUsd: 2 }),
        });

        const actualizado = await crearArticulosApi().actualizarProducto(
            { id: 9, peso: 2, stock: 2, categoria: "Lácteos" },
            { stock: 3.5, descripcion: "Actualizado" },
        );

        expect(actualizado.categoria).toBe("Lácteos");
        expect(fetch).toHaveBeenCalledWith("/api/productos/9", expect.objectContaining({
            method: "PUT",
            body: JSON.stringify({ peso: 3.5, descripcion: "Actualizado" }),
        }));
    });
});
