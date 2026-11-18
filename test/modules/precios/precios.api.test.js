import { jest } from "@jest/globals";
import { crearPreciosApi } from "../../../public/modules/Precios/precios.api.js";

describe("crearPreciosApi", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("elimina un producto usando DELETE y acepta la respuesta 204", async () => {
        const fetch = jest.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 204,
        });

        await expect(crearPreciosApi().eliminarProducto(12)).resolves.toBeNull();

        expect(fetch).toHaveBeenCalledWith("/api/productos/12", expect.objectContaining({
            method: "DELETE",
        }));
    });
});
