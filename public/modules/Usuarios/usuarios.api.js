import { solicitarJson } from "../../common/api/httpClient.js";

export function crearUsuariosApi(base = "/api") {
    return {
        listar() {
            return solicitarJson(`${base}/usuarios`);
        },

        actualizar(id, payload) {
            return solicitarJson(`${base}/usuarios/${id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });
        },

        eliminar(id) {
            return solicitarJson(`${base}/usuarios/${id}`, { method: "DELETE" });
        },

        crear(payload) {
            return solicitarJson(`${base}/usuarios`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },
    };
}
