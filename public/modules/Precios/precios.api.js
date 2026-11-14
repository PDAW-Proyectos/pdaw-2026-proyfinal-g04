import { solicitarJson } from "../../common/api/httpClient.js";

export function crearPreciosApi(base = "/api") {
    return {
        listar({ pagina, limite, termino = "" }) {
            const url = `${base}/productos/?pagina=${pagina}&limite=${limite}`;
            const opciones = termino ? { method: "QUERY", body: JSON.stringify({ nombre: termino }) } : {};

            return solicitarJson(url, opciones);
        },

        consultarDolar() {
            return solicitarJson(`${base}/cotizacion`);
        },

        actualizarPrecios(operacion) {
            return solicitarJson(`${base}/productos/actualizar-precios`, {
                method: "PUT",
                body: JSON.stringify(operacion),
            });
        },

        actualizarProducto(id, payload) {
            return solicitarJson(`${base}/productos/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
        },

        crearProducto(payload) {
            return solicitarJson(`${base}/productos`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
    };
}
