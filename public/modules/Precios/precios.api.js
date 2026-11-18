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
            const url = operacion.porcentaje ? `${base}/productos/actualizar-precios-porcentaje` : `${base}/productos/actualizar-precios`;
            return solicitarJson(url, {
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

        eliminarProducto(id) {
            return solicitarJson(`${base}/productos/${encodeURIComponent(id)}`, {
                method: "DELETE",
            });
        },
    };
}
