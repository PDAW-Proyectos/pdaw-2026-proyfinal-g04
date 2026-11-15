import { solicitarJson } from "../../common/api/httpClient.js";
import { crearUrlConPaginacion, obtenerTodasLasPaginas } from "../../common/api/paginacion.js";

export function crearCajaApi(base = "/api") {
    const listarColeccion = (recurso, clave) =>
        obtenerTodasLasPaginas({
            clave,
            solicitar: (pagina, limite) =>
                solicitarJson(crearUrlConPaginacion(`${base}/${recurso}`, pagina, limite)),
        });

    const listarConFiltros = (recurso, clave, filtros) =>
        obtenerTodasLasPaginas({
            clave,
            solicitar: (pagina, limite) =>
                solicitarJson(crearUrlConPaginacion(`${base}/${recurso}`, pagina, limite), {
                    method: "QUERY",
                    body: JSON.stringify(filtros),
                }),
        });

    return {
        listarProductos() {
            return listarColeccion("productos", "productos");
        },

        buscarProducto(id) {
            return solicitarJson(`${base}/productos/${Number(id)}`);
        },

        filtrarProductos(filtros) {
            return obtenerTodasLasPaginas({
                clave: "productos",
                solicitar: (pagina, limite) =>
                    solicitarJson(crearUrlConPaginacion(`${base}/productos`, pagina, limite), {
                        method: "QUERY",
                        body: JSON.stringify(filtros),
                    }),
            });
        },

        listarCategorias() {
            return listarColeccion("categorias", "categorias");
        },

        async listarCajasAbiertas() {
            const respuesta = await solicitarJson(`${base}/caja/?pagina=1&limite=10`, {
                method: "QUERY",
                body: JSON.stringify({ estado: "abierta" }),
            });

            return respuesta.cajas ?? [];
        },

        buscarCaja(id) {
            return solicitarJson(`${base}/caja/${id}`);
        },

        crearCaja({ nroCaja, montoInicial }) {
            return solicitarJson(`${base}/caja/`, {
                method: "POST",
                body: JSON.stringify({
                    nroCaja: nroCaja,
                    montoInicial: Number(montoInicial),
                }),
            });
        },

        listarVentasCaja(idCaja) {
            return listarConFiltros("ingreso", "ingresos", {
                idCaja: Number(idCaja),
                articulos: [{}],
            });
        },

        listarTransaccionesCaja(idCaja) {
            return listarConFiltros("transacciones", "transacciones", {
                idCaja: Number(idCaja),
            });
        },

        registrarVenta(idCaja, { monto, metodoDePago, articulos }) {
            return solicitarJson(`${base}/caja/${idCaja}/venta`, {
                method: "POST",
                body: JSON.stringify({
                    monto: Number(monto),
                    metodoDePago,
                    articulos,
                }),
            });
        },

        registrarRetiro(idCaja, { monto }) {
            return solicitarJson(`${base}/caja/${idCaja}/retiro`, {
                method: "POST",
                body: JSON.stringify({ monto: Number(monto) }),
            });
        },

        cerrarCaja(idCaja, { totalContado, observaciones }) {
            return solicitarJson(`${base}/caja/${idCaja}/cerrar`, {
                method: "PUT",
                body: JSON.stringify({
                    totalContado: Number(totalContado),
                    observaciones,
                }),
            });
        },
    };
}
