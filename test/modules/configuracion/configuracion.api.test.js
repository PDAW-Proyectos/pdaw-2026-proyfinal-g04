import { jest } from "@jest/globals";
import { crearConfiguracionApi } from "../../../public/modules/Configuracion/configuracion.api.js";

describe("crearConfiguracionApi", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test.each([
        [
            { negocio: { nombre: "Mi comercio", telefono: "", direccion: "" } },
            "/api/configuracion/negocio",
            { nombre: "Mi comercio", telefono: "", direccion: "" },
        ],
        [
            { stock: { critico: 4, medio: 12 } },
            "/api/configuracion/stock",
            { critico: 4, medio: 12 },
        ],
        [
            { sessionDurationMinutes: 30 },
            "/api/configuracion/expiracion",
            { sessionDurationMinutes: 30 },
        ],
    ])("actualiza la configuración en %s", async (payload, url, datos) => {
        const fetch = jest.spyOn(globalThis, "fetch").mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({}),
        });

        await crearConfiguracionApi().actualizar(payload);

        expect(fetch).toHaveBeenCalledWith(url, expect.objectContaining({
            method: "PATCH",
            body: JSON.stringify(datos),
        }));
    });

    test("rechaza configuraciones sin un recurso reconocido", () => {
        expect(() => crearConfiguracionApi().actualizar({})).toThrow(
            "La configuración enviada no es válida",
        );
    });
});
