import { solicitarJson } from "../../common/api/httpClient.js";

export function crearCategoriasApi(base = "/api") {
    return {
        listar() {
            return solicitarJson(`${base}/categorias`);
        },

        obtener(id) {
            return solicitarJson(`${base}/categirias/${encodeURIComponent(id)}`);
        },

        crear(nombre) {
            return solicitarJson(`${base}/categorias`, {
                method: "POST",
                body: JSON.stringify({ nombre }),
            });
        },

        actualizarNombre(payload) {
            return solicitarJson(`${base}/categorias/${encodeURIComponent(payload.id)}/nombre`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        actualizarProductos(payload) {
            return solicitarJson(`${base}/categorias/${encodeURIComponent(payload.id)}/productos`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        eliminar(id) {
            return solicitarJson(`${base}/categorias/${encodeURIComponent(id)}`, { method: "DELETE" });
        },
    };
}
