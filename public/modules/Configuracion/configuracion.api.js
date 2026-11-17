import { solicitarJson } from "../../common/api/httpClient.js";

export function crearConfiguracionApi(base = "/api") {
    return {
        obtener() {
            return solicitarJson(`${base}/configuracion`);
        },

        listarCajas() {
            return solicitarJson(`${base}/configuracion/cajas`);
        },

        actualizar(payload) {
            return solicitarJson(`${base}/configuracion`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },
    };
}
