import { solicitarJson } from "../../common/api/httpClient.js";

export function crearConfiguracionApi(base = "/api") {
    const categoriasBase = `${base}/categorias`;

    return {
        obtener() {
            return solicitarJson(`${base}/configuracion`);
        },

        actualizar(payload) {
            return solicitarJson(`${base}/configuracion`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },
    };
}
