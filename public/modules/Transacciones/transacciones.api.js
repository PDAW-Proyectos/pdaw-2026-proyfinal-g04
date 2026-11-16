import { solicitarJson } from "../../common/api/httpClient.js";
import { crearUrlConPaginacion, obtenerTodasLasPaginas } from "../../common/api/paginacion.js";

export function crearTransaccionesApi(base = "/api") {
    const listar = (filtros) =>
        obtenerTodasLasPaginas({
            clave: "transacciones",
            solicitar: (pagina, limite) =>
                solicitarJson(crearUrlConPaginacion(`${base}/transacciones`, pagina, limite), {
                    method: "QUERY",
                    body: JSON.stringify(filtros),
                }),
        });

    return {
        listarPorUsuario(idUsuario) {
            return listar({ idUsuario: Number(idUsuario) });
        },

        async buscarPorTicket(id, idUsuario) {
            const respuesta = await solicitarJson(`${base}/transacciones/?pagina=1&limite=10`, {
                method: "QUERY",
                body: JSON.stringify({
                    id: Number(id),
                    idUsuario: Number(idUsuario),
                }),
            });

            return respuesta.transacciones ?? [];
        },
    };
}
