import { solicitarJson } from "../../common/api/httpClient.js";

export function crearArticulosApi(base = "/api") {
    return {
        async cargarUmbralesStock() {
            const { stock } = await solicitarJson(`${base}/configuracion/stock`);

            if (!Number.isInteger(stock?.critico) || !Number.isInteger(stock?.medio) || stock.critico < 0 || stock.medio <= stock.critico) {
                throw new Error("El backend devolvió umbrales de stock inválidos");
            }

            return stock;
        },
    };
}
