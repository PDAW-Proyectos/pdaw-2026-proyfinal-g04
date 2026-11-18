import { renderizarIconos } from "../../common/utils/iconos.js";
import { crearHistorialApi } from "./historial.api.js";
import { crearTablaMovimientos } from "./tablaMovimientos.js";
import { crearPaginacionMovimientos } from "./paginacion.movimientos.js";

export function iniciarHistorial() {
    renderizarIconos();

    const api = crearHistorialApi();
    const estado = {
        paginaActual: 1,
        limite: 10,
        totalPaginas: 1,
        totalMovimientos: 0,
    };

    const tabla = crearTablaMovimientos({
        tbody: document.getElementById("tabla-movimientos-body"),
    });

    const paginacion = crearPaginacionMovimientos({
        async onCambiarPagina(nuevaPagina) {
            estado.paginaActual = nuevaPagina;
            await cargar();
        },
    });

    async function cargar() {
        try {
            const res = await api.listar({
                pagina: estado.paginaActual,
                limite: estado.limite,
            });

            const lista = res.datos || res.movimientos || [];
            const total = res.total ?? lista.length;
            const totalPaginas = res.totalPaginas ?? Math.max(1, Math.ceil(total / estado.limite));

            estado.totalMovimientos = total;
            estado.totalPaginas = totalPaginas;

            tabla.render(lista);
            paginacion.render(estado);
        } catch (error) {
            console.error("Error al cargar historial de movimientos:", error);
        }
    }

    cargar();

    return { recargar: cargar };
}