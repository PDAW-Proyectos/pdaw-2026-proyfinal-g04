import { solicitarJson } from "../../common/api/httpClient.js";

export function crearConfiguracionApi(base = "/api") {
    return {
        obtener() {
            return solicitarJson(`${base}/configuracion`);
        },

        obtenerStock() {
            return solicitarJson(`${base}/configuracion/stock`);
        },

        obtenerSesion() {
            return solicitarJson(`${base}/configuracion/sesion`);
        },

        obtenerNegocio() {
            return solicitarJson(`${base}/configuracion/negocio`);
        },

        listarCajas() {
            return solicitarJson(`${base}/configuracion/cajas`);
        },

        actualizarNegocio(payload) {
            return solicitarJson(`${base}/configuracion/negocio`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        actualizarStock(payload) {
            return solicitarJson(`${base}/configuracion/stock`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        actualizarExpiracion(payload) {
            return solicitarJson(`${base}/configuracion/expiracion`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        actualizarDuracionSesion(payload) {
            return solicitarJson(`${base}/configuracion/sesion`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        crearCaja(payload) {
            return solicitarJson(`${base}/configuracion/cajas`, {
                method: "POST",
                body: JSON.stringify(payload),
            });
        },

        actualizarCaja(nombre, payload) {
            return solicitarJson(`${base}/configuracion/cajas/${encodeURIComponent(nombre)}`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },

        actualizar(payload) {
            return solicitarJson(`${base}/configuracion`, {
                method: "PATCH",
                body: JSON.stringify(payload),
            });
        },
    };
}