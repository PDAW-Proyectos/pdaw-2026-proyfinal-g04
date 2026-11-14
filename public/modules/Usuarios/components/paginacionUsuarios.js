import { crearPaginador } from "../../../common/components/paginacion.js";

export function crearPaginacionUsuarios({ store, render }) {
    const paginador = crearPaginador({
        contenedor: document.getElementById("numeros-paginacion-usuarios"),
        btnAnterior: document.getElementById("btn-anterior-usuarios"),
        btnSiguiente: document.getElementById("btn-siguiente-usuarios"),
        info: document.getElementById("info-total-usuarios"),
        onSeleccionar(pagina) {
            store.setPagina(pagina);
            render();
        },
    });

    return {
        render() {
            paginador.render({
                pagina: store.obtenerPaginaActual(),
                totalPaginas: store.obtenerTotalPaginas(),
                textoInfo: `Mostrando ${store.obtenerFiltrados().length} usuarios`,
            });
        },
    };
}
