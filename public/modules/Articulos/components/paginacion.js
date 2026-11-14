import { crearPaginador } from "../../../common/components/paginacion.js";

export function crearPaginacionInventario({ onSeleccionar }) {
    const paginador = crearPaginador({
        contenedor: document.getElementById("numeros-paginacion"),
        btnAnterior: document.getElementById("btn-anterior"),
        btnSiguiente: document.getElementById("btn-siguiente"),
        onSeleccionar,
    });

    return {
        render(pagina, totalPaginas) {
            paginador.render({ pagina, totalPaginas });
        },
    };
}

export function crearPaginacionProveedores({ onSeleccionar }) {
    const paginador = crearPaginador({
        contenedor: document.getElementById("numeros-paginacion-prov"),
        btnAnterior: document.getElementById("btn-anterior-prov"),
        btnSiguiente: document.getElementById("btn-siguiente-prov"),
        onSeleccionar,
    });

    return {
        render(pagina, totalPaginas) {
            paginador.render({ pagina, totalPaginas });
        },
    };
}
