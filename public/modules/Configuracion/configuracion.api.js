import { solicitarJson } from "../../common/api/httpClient.js";

export function crearConfiguracionApi(base = "/api") {
    return {
        obtener() {
            return solicitarJson(`${base}/configuracion`);
        },

        listarCajas() {
            return solicitarJson(`${base}/configuracion/cajas`);
        },

        crearCaja(payload) {
            return solicitarJson(`${base}/configuracion/cajas`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },

        actualizar(payload) {
            let recurso;
            let datos;

            if (payload?.negocio) {
                recurso = "negocio";
                datos = payload.negocio;
            } else if (payload?.stock) {
                recurso = "stock";
                datos = payload.stock;
            } else if (Object.prototype.hasOwnProperty.call(payload ?? {}, "sessionDurationMinutes")) {
                recurso = "expiracion";
                datos = payload;
            } else {
                throw new Error("La configuración enviada no es válida");
            }

            return solicitarJson(`${base}/configuracion/${recurso}`, {
                method: "PATCH",
                body: JSON.stringify(datos),
            });
        },
    };
}
