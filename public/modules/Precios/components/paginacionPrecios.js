import { crearPaginador } from "../../../common/components/paginacion.js";

export function crearPaginacionPrecios({ store, onCambiarPagina }) {
    const paginador = crearPaginador({
        contenedor: document.getElementById("numeros-paginacion-precios"),
        btnAnterior: document.getElementById("btn-anterior-precios"),
        btnSiguiente: document.getElementById("btn-siguiente-precios"),
        info: document.getElementById("info-total-productos"),
        onSeleccionar: onCambiarPagina,
    });

    return {
        render(estado) {
            paginador.render({
                pagina: estado.paginaActual,
                totalPaginas: estado.totalPaginas,
                textoInfo: `Mostrando página ${estado.paginaActual} de ${estado.totalPaginas} (${estado.totalProductos} en total)`,
            });
        },
    };
}
