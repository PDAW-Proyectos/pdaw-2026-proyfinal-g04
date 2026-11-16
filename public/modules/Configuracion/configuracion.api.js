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

        listarCategorias() {
            return solicitarJson(categoriasBase);
        },

        crearCategoria(nombre) {
            return solicitarJson(categoriasBase, {
                method: "POST",
                body: JSON.stringify({ nombre }),
            });
        },

        eliminarCategoria(id) {
            return solicitarJson(`${categoriasBase}/${encodeURIComponent(id)}`, { method: "DELETE" });
        },

        listarCajas() {
            return solicitarJson(`${base}/configuracion/cajas`);
        },

        crearCaja(nombre) {
            return solicitarJson(`${base}/configuracion/cajas`, {
                method: "POST",
                body: JSON.stringify({ nombre }),
            });
        },

        actualizarCaja(nombreActual, nombreNuevo) {
            return solicitarJson(`${base}/configuracion/cajas/${encodeURIComponent(nombreActual)}`, {
                method: "PATCH",
                body: JSON.stringify({ nombre: nombreNuevo }),
            });
        },
    };
}
