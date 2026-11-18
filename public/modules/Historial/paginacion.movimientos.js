import { crearPaginador } from "../../common/components/paginacion.js";

export function crearPaginacionMovimientos({ onCambiarPagina }) {
    const paginador = crearPaginador({
        contenedor: document.getElementById("numeros-paginacion-mov"),
        btnAnterior: document.getElementById("btn-anterior-mov"),
        btnSiguiente: document.getElementById("btn-siguiente-mov"),
        info: document.getElementById("info-total-movimientos"), // opcional si agregás un span
        onSeleccionar: onCambiarPagina,
    });

    return {
        render({ paginaActual, totalPaginas, totalMovimientos }) {
            paginador.render({
                pagina: paginaActual,
                totalPaginas,
                textoInfo: `Mostrando página ${paginaActual} de ${totalPaginas} (${totalMovimientos} en total)`,
            });
        },
    };
}