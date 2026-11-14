export function crearArticulosStore({ inventario, proveedores, itemsPorPagina = 12, itemsPorPaginaProv = 10 }) {
    let baseProductos = [...inventario];
    let productosFiltrados = [...baseProductos];
    let proveedoresFiltrados = [...proveedores];
    let umbralesStock = { critico: 5, medio: 10 };
    let paginaActual = 1;
    let paginaProvActual = 1;
    let columnaOrdenActual = null;
    let ordenAscendente = true;
    let columnaOrdenProvActual = null;
    let ordenProvAscendente = true;

    const ordenarLista = (lista, columna, ascendente) => {
        lista.sort((a, b) => {
            let valorA = a[columna];
            let valorB = b[columna];

            if (typeof valorA === "string") valorA = valorA.toLowerCase();
            if (typeof valorB === "string") valorB = valorB.toLowerCase();

            if (valorA < valorB) return ascendente ? -1 : 1;
            if (valorA > valorB) return ascendente ? 1 : -1;
            return 0;
        });
    };

    return {
        obtenerPaginaProductos() {
            const inicio = (paginaActual - 1) * itemsPorPagina;
            return productosFiltrados.slice(inicio, inicio + itemsPorPagina);
        },

        obtenerPaginaProveedores() {
            const inicio = (paginaProvActual - 1) * itemsPorPaginaProv;
            return proveedoresFiltrados.slice(inicio, inicio + itemsPorPaginaProv);
        },

        obtenerPaginaActual: () => paginaActual,
        obtenerPaginaProvActual: () => paginaProvActual,
        obtenerTotalPaginas: () => Math.ceil(productosFiltrados.length / itemsPorPagina),
        obtenerTotalPaginasProv: () => Math.ceil(proveedoresFiltrados.length / itemsPorPaginaProv),
        obtenerUmbrales: () => umbralesStock,
        obtenerProductos: () => [...baseProductos],
        obtenerProveedores: () => [...proveedoresFiltrados],

        establecerUmbrales(stock) {
            umbralesStock = stock;
        },

        setPagina(pagina) {
            if (pagina < 1 || pagina > this.obtenerTotalPaginas()) return;
            paginaActual = pagina;
        },

        setPaginaProveedores(pagina) {
            if (pagina < 1 || pagina > this.obtenerTotalPaginasProv()) return;
            paginaProvActual = pagina;
        },

        filtrarProductos({ termino = "", estadoStock = "" } = {}) {
            const busqueda = termino.toLowerCase();

            productosFiltrados = baseProductos.filter((producto) => {
                const coincideTexto = producto.nombre.toLowerCase().includes(busqueda) || producto.id.toLowerCase().includes(busqueda) || producto.categoria.toLowerCase().includes(busqueda) || producto.precio.toString().includes(busqueda);

                let coincideSemaforo = true;
                if (estadoStock === "critico") {
                    coincideSemaforo = producto.stock <= umbralesStock.critico;
                } else if (estadoStock === "advertencia") {
                    coincideSemaforo = producto.stock > umbralesStock.critico && producto.stock <= umbralesStock.medio;
                } else if (estadoStock === "normal") {
                    coincideSemaforo = producto.stock > umbralesStock.medio;
                }

                return coincideTexto && coincideSemaforo;
            });

            paginaActual = 1;
        },

        filtrarProveedores({ termino = "" } = {}) {
            const busqueda = termino.toLowerCase();

            proveedoresFiltrados = proveedores.filter((proveedor) => proveedor.empresa.toLowerCase().includes(busqueda) || proveedor.rubro.toLowerCase().includes(busqueda) || proveedor.id.toLowerCase().includes(busqueda) || proveedor.contacto.toLowerCase().includes(busqueda));

            paginaProvActual = 1;
        },

        ordenarProductos(columna) {
            if (columnaOrdenActual === columna) {
                ordenAscendente = !ordenAscendente;
            } else {
                columnaOrdenActual = columna;
                ordenAscendente = true;
            }

            ordenarLista(productosFiltrados, columna, ordenAscendente);
            paginaActual = 1;
        },

        ordenarProveedores(columna) {
            if (columnaOrdenProvActual === columna) {
                ordenProvAscendente = !ordenProvAscendente;
            } else {
                columnaOrdenProvActual = columna;
                ordenProvAscendente = true;
            }

            ordenarLista(proveedoresFiltrados, columna, ordenProvAscendente);
            paginaProvActual = 1;
        },

        buscarProducto(id) {
            const buscado = id.toString().toLowerCase();
            return baseProductos.find((producto) => producto.id.toString().toLowerCase() === buscado);
        },

        actualizarProducto(id, cambios) {
            const producto = baseProductos.find((item) => item.id.toString() === id.toString());

            if (!producto) return false;

            Object.assign(producto, cambios);
            return true;
        },
    };
}
