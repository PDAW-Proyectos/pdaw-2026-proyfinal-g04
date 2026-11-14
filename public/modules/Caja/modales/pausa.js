import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function crearModalPausa({ store }) {
    const modalPausa = document.getElementById("modal-pausa");
    const contenedorPausadas = document.getElementById("contenedor-ventas-pausadas");
    const btnConfirmarPausa = document.getElementById("btn-confirmar-pausa");

    const cerrarModalPausa = () => cerrarModalOverlay(modalPausa);

    const actualizarEstadoBotonPausa = () => {
        if (!btnConfirmarPausa) return;

        const hayVentaActual = store.hayVentaActual();
        btnConfirmarPausa.disabled = !hayVentaActual;
        btnConfirmarPausa.style.opacity = hayVentaActual ? "1" : "0.5";
        btnConfirmarPausa.style.cursor = hayVentaActual ? "pointer" : "not-allowed";
    };

    const renderizarVentasPausadas = () => {
        const ventasPausadas = store.obtenerVentasPausadas();
        if (!contenedorPausadas) return;

        if (ventasPausadas.length === 0) {
            contenedorPausadas.innerHTML = '<p class="estado-vacio-pausa">No hay ventas pausadas en este momento.</p>';
            return;
        }

        contenedorPausadas.innerHTML = "";
        ventasPausadas.forEach((pausa) => {
            const cantidadItems = pausa.items.reduce((acc, item) => acc + item.cantidad, 0);
            const totalPrecio = pausa.items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

            contenedorPausadas.insertAdjacentHTML(
                "beforeend",
                `
                    <div class="venta-pausada-item">
                        <div class="venta-pausada-info">
                        <strong>Ticket en espera (${pausa.hora})</strong>
                        <span>${cantidadItems} artículos - ${formatearPrecio(totalPrecio)}</span>
                        </div>
                        <button type="button" class="btn-recuperar" data-accion="recuperar-venta" data-id="${pausa.id}">
                        Recuperar
                        </button>
                    </div>
                `,
            );
        });
    };

    const abrirModalPausa = () => {
        renderizarVentasPausadas();
        abrirModalOverlay(modalPausa);
    };

    const pausarVenta = () => {
        if (!store.pausarVenta()) return;

        cerrarModalPausa();
        alert("Venta pausada. Podés atender al siguiente cliente");
    };

    const recuperarVenta = (id) => {
        const resultado = store.recuperarVenta(id);

        if (resultado === "ocupado") {
            alert("Tenés una venta en curso. Pausala o cobrala antes de recuperar otra.");
            return;
        }

        if (resultado) cerrarModalPausa();
    };

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-pausa"]')) {
            abrirModalPausa();
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-pausa"]')) {
            cerrarModalPausa();
            return;
        }

        if (event.target.closest('[data-accion="confirmar-pausa"]')) {
            pausarVenta();
            return;
        }

        const btnRecuperar = event.target.closest('[data-accion="recuperar-venta"]');
        if (btnRecuperar) {
            recuperarVenta(Number(btnRecuperar.dataset.id));
        }
    });

    store.suscribir(actualizarEstadoBotonPausa);
    actualizarEstadoBotonPausa();

    return { actualizarEstadoBotonPausa };
}
