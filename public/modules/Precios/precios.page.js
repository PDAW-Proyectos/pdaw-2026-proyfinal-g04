import { mostrarToast } from "../../common/utils/alertas.js";
import { confirmarAccion } from "../../common/utils/confirmar.js";
import { renderizarIconos } from "../../common/utils/iconos.js";
import { crearPreciosApi } from "./precios.api.js";
import { crearPreciosStore } from "./precios.store.js";
import { crearTablaPrecios } from "./components/tablaPrecios.js";
import { crearDashboardPrecios } from "./components/dashboardPrecios.js";
import { crearPaginacionPrecios } from "./components/paginacionPrecios.js";
import { crearModalEditarProducto } from "./modales/editarProducto.js";
import { crearModalCrearProducto } from "./modales/crearProducto.js";

export async function iniciarPrecios() {
    renderizarIconos();

    const api = crearPreciosApi();
    const store = crearPreciosStore(api);
    const notificar = mostrarToast;
    const inputBuscador = document.getElementById("buscar-producto");
    const inputPorcentaje = document.getElementById("input-porcentaje");
    const btnDeshacer = document.getElementById("btn-deshacer");
    const btnGuardarCambios = document.getElementById("btn-guardar-cambios");

    const dashboard = crearDashboardPrecios();
    const tabla = crearTablaPrecios({
        tbody: document.getElementById("tabla-body-precios"),
        onEditar(id) {
            const producto = store.obtenerProducto(id);
            if (producto) modalEditar.abrir(producto);
        },
    });

    const modalEditar = crearModalEditarProducto({ store, notificar });

    crearModalCrearProducto({ store, notificar });

    const paginacion = crearPaginacionPrecios({
        store,
        async onCambiarPagina(pagina) {
            if (store.obtenerEstado().hayCambiosSinGuardar) {
                notificar("Por favor, guardá o deshacé la prueba antes de cambiar de página", true);
                return;
            }

            store.setPagina(pagina);
            try {
                await store.cargar(obtenerTermino());
            } catch (error) {
                console.error("Error cargando la tabla desde el backend:", error);
            }
        },
    });

    const obtenerTermino = () => (inputBuscador ? inputBuscador.value.trim() : "");

    store.suscribir((estado) => {
        tabla.render(estado.catalogoEdicion, estado.hayCambiosSinGuardar);
        dashboard.render(estado);
        paginacion.render(estado);

        if (btnDeshacer) {
            btnDeshacer.disabled = estado.historialCambios.length === 0;
        }
    });

    const recargar = async () => {
        try {
            await store.cargar(obtenerTermino());
        } catch (error) {
            console.error("Error cargando la tabla desde el backend:", error);
        }
    };

    if (inputBuscador) {
        inputBuscador.addEventListener("input", () => {
            store.setPagina(1);
            recargar();
        });
    }

    document.getElementById("btn-aplicar-dolar")?.addEventListener("click", () => {
        if (!store.aplicarDolar()) {
            notificar("Cotización no disponible aún.", true);
        }
    });

    if (inputPorcentaje) {
        inputPorcentaje.addEventListener("input", (event) => {
            const porcentaje = parseFloat(event.target.value);
            const estado = store.obtenerEstado();

            dashboard.render(estado, Number.isNaN(porcentaje) ? null : store.calcularImpactoPorcentaje(porcentaje));
        });
    }

    document.getElementById("btn-aplicar-porcentaje")?.addEventListener("click", () => {
        const porcentaje = parseFloat(inputPorcentaje.value);
        if (Number.isNaN(porcentaje) || porcentaje === 0) return;

        store.aplicarPorcentaje(porcentaje);
        inputPorcentaje.value = "";
    });

    if (btnDeshacer) {
        btnDeshacer.addEventListener("click", () => {
            store.deshacer();
        });
    }

    if (btnGuardarCambios) {
        btnGuardarCambios.addEventListener("click", async () => {
            if (!store.obtenerEstado().operacionMasivaPendiente) return;

            const confirmado = await confirmarAccion({
                titulo: "Confirmar publicación",
                mensaje: "Estás a punto de actualizar los precios de todo el catálogo en el sistema.",
                textoConfirmar: "Sí, publicar",
            });

            if (!confirmado) return;

            try {
                await store.publicar();
                dashboard.marcarPublicado();
                notificar("¡El catálogo se actualizó exitosamente!");
            } catch (error) {
                console.error(error);
                notificar("Hubo un error al publicar los cambios.", true);
            }
        });
    }

    await recargar();

    try {
        const dolar = await store.consultarDolar();
        dashboard.actualizarDolarVivo(dolar);
    } catch (error) {
        console.error("Error al consultar DolarAPI desde el backend:", error);
        dashboard.mostrarErrorDolar();
    }
}
