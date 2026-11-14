export function crearUsuariosStore({ itemsPorPagina = 10 } = {}) {
    let usuariosBase = [];
    let usuariosFiltrados = [];
    let paginaActual = 1;
    let columnaOrden = null;
    let ordenAscendente = true;

    const totalPaginas = () => Math.ceil(usuariosFiltrados.length / itemsPorPagina) || 1;

    return {
        obtenerBase: () => usuariosBase,
        obtenerFiltrados: () => usuariosFiltrados,
        obtenerPaginaActual: () => paginaActual,
        obtenerTotalPaginas: totalPaginas,
        obtenerColumnaOrden: () => columnaOrden,
        esOrdenAscendente: () => ordenAscendente,

        obtenerPagina() {
            const inicio = (paginaActual - 1) * itemsPorPagina;
            return usuariosFiltrados.slice(inicio, inicio + itemsPorPagina);
        },

        establecerBase(usuarios) {
            usuariosBase = [...usuarios];
            usuariosFiltrados = [...usuariosBase];
            paginaActual = 1;
            columnaOrden = null;
            ordenAscendente = true;
        },

        filtrar({ termino = "", rol = "todos" } = {}) {
            const busqueda = termino.toLowerCase().trim();

            usuariosFiltrados = usuariosBase.filter((user) => {
                const nombreTexto = user.nombre ? user.nombre.toLowerCase() : "";
                const idTexto = user.id ? user.id.toString().toLowerCase() : "";
                const coincideTexto = nombreTexto.includes(busqueda) || idTexto.includes(busqueda);

                let coincideRol = true;
                if (rol && rol !== "todos") {
                    coincideRol = user.rol === rol;
                }

                return coincideTexto && coincideRol;
            });

            paginaActual = 1;
        },

        ordenar(columna) {
            if (columnaOrden === columna) {
                ordenAscendente = !ordenAscendente;
            } else {
                columnaOrden = columna;
                ordenAscendente = true;
            }

            usuariosFiltrados.sort((a, b) => {
                let valorA = a[columna] != null ? a[columna] : "";
                let valorB = b[columna] != null ? b[columna] : "";

                if (typeof valorA === "string") valorA = valorA.toLowerCase();
                if (typeof valorB === "string") valorB = valorB.toLowerCase();

                if (valorA < valorB) return ordenAscendente ? -1 : 1;
                if (valorA > valorB) return ordenAscendente ? 1 : -1;
                return 0;
            });

            paginaActual = 1;
        },

        setPagina(pagina) {
            if (pagina < 1 || pagina > totalPaginas()) return;
            paginaActual = pagina;
        },
    };
}
