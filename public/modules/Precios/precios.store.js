import { redondearPrecio } from "../../common/utils/formato.js";

export function crearPreciosStore(api) {
    let estado = {
        catalogoBase: [],
        catalogoEdicion: [],
        ultimoDolarGuardado: null,
        dolarApiEnVivo: null,
        historialCambios: [],
        hayCambiosSinGuardar: false,
        operacionMasivaPendiente: null,
        paginaActual: 1,
        totalPaginas: 1,
        totalProductos: 0,
    };
    let ultimoTermino = "";

    const oyentes = new Set();

    const actualizar = (cambios) => {
        estado = { ...estado, ...cambios };
        oyentes.forEach((oyente) => oyente(estado));
    };

    const mapearProducto = (producto) => {
        const precioUsd = producto.precioUsd ?? 0;
        const cotizacion = Number(producto.cotizacion ?? 0);

        return {
            id: producto.id,
            nombre: producto.nombre,
            categoria: producto.categoria || "General",
            precioUsd,
            precioArs: producto.precio ?? producto.precioArs ?? (cotizacion > 0 ? redondearPrecio(precioUsd * cotizacion) : 0),
            stock: producto.stock ?? producto.unidad ?? producto.peso ?? 0,
            descripcion: producto.descripcion || "",
        };
    };

    const copiarCatalogo = () => JSON.parse(JSON.stringify(estado.catalogoEdicion));

    const store = {
        obtenerEstado: () => estado,

        obtenerProducto(id) {
            return estado.catalogoEdicion.find((producto) => String(producto.id) === String(id));
        },

        suscribir(oyente) {
            oyentes.add(oyente);
            return () => oyentes.delete(oyente);
        },

        setPagina(pagina) {
            actualizar({ paginaActual: pagina });
        },

        calcularImpactoPorcentaje(porcentaje) {
            const precioActualBase = estado.catalogoBase[0]?.precioArs || 0;
            return redondearPrecio(precioActualBase * (1 + porcentaje / 100));
        },

        async cargar(termino = ultimoTermino) {
            ultimoTermino = termino;
            const resultado = await api.listar({
                pagina: estado.paginaActual,
                limite: 12,
                termino,
            });

            const productos = resultado.productos || resultado.datos || resultado;
            const mapeados = productos.map(mapearProducto);

            actualizar({
                catalogoBase: estado.catalogoBase.length ? estado.catalogoBase : [...mapeados],
                catalogoEdicion: mapeados,
                totalPaginas: resultado.totalPaginas ?? 1,
                totalProductos: resultado.total ?? mapeados.length,
                historialCambios: [],
                hayCambiosSinGuardar: false,
                operacionMasivaPendiente: null,
            });
        },

        async recargar() {
            await store.cargar(ultimoTermino);
        },

        async consultarDolar() {
            const data = await api.consultarDolar();
            const dolar = data.cotizacion?.venta ?? data.venta;

            if (typeof dolar !== "number") {
                throw new Error("Cotización inválida");
            }

            actualizar({
                dolarApiEnVivo: dolar,
                ultimoDolarGuardado: estado.ultimoDolarGuardado ?? dolar,
            });

            return dolar;
        },

        aplicarDolar() {
            if (!estado.dolarApiEnVivo) return false;

            actualizar({
                historialCambios: [...estado.historialCambios, copiarCatalogo()],
                catalogoEdicion: estado.catalogoEdicion.map((producto) => ({
                    ...producto,
                    precioArs: redondearPrecio(producto.precioUsd * estado.dolarApiEnVivo),
                })),
                operacionMasivaPendiente: {
                    tipo: "dolar",
                    valor: estado.dolarApiEnVivo,
                },
                hayCambiosSinGuardar: true,
            });

            return true;
        },

        aplicarPorcentaje(porcentaje) {
            if (Number.isNaN(porcentaje) || porcentaje === 0) return false;

            actualizar({
                historialCambios: [...estado.historialCambios, copiarCatalogo()],
                catalogoEdicion: estado.catalogoEdicion.map((producto) => ({
                    ...producto,
                    precioArs: redondearPrecio(producto.precioArs * (1 + porcentaje / 100)),
                })),
                operacionMasivaPendiente: { tipo: "porcentaje", valor: porcentaje },
                hayCambiosSinGuardar: true,
            });

            return true;
        },

        deshacer() {
            if (estado.historialCambios.length === 0) return false;

            const historialCambios = estado.historialCambios.slice(0, -1);
            const catalogoEdicion = estado.historialCambios[estado.historialCambios.length - 1];
            const quedoSinCambios = historialCambios.length === 0;

            actualizar({
                catalogoEdicion,
                historialCambios,
                hayCambiosSinGuardar: quedoSinCambios ? false : estado.hayCambiosSinGuardar,
                operacionMasivaPendiente: quedoSinCambios ? null : estado.operacionMasivaPendiente,
            });

            return true;
        },

        async publicar() {
            if (!estado.operacionMasivaPendiente) return false;

            await api.actualizarPrecios(estado.operacionMasivaPendiente);
            await store.recargar();
            return true;
        },

        async actualizarProducto(id, payload) {
            await api.actualizarProducto(id, payload);
            await store.recargar();
        },

        async crearProducto(payload) {
            await api.crearProducto(payload);
            actualizar({ paginaActual: 1 });
            await store.recargar();
        },
    };

    return store;
}
