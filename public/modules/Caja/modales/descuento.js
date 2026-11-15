import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalDescuento({ store, notificar }) {
    const modalDescuento = document.getElementById("modal-descuento");
    const inputValorMod = document.getElementById("input-valor-mod");
    const selectorModo = document.getElementById("modo-valor-mod");
    const prevSubtotal = document.getElementById("prev-subtotal");
    const prevNuevoTotal = document.getElementById("prev-nuevo-total");
    let estadoModificador = "descuento";

    const calcularPrevisualizacion = () => {
        const subtotalActual = store.subtotal();
        const valorInput = parseFloat(inputValorMod?.value) || 0;
        const modo = selectorModo?.value === "fijo" ? "fijo" : "porcentaje";
        const montoModificacion = modo === "porcentaje"
            ? subtotalActual * (valorInput / 100)
            : valorInput;

        let nuevoTotal = subtotalActual;
        if (estadoModificador === "descuento") {
            nuevoTotal -= montoModificacion;
        } else {
            nuevoTotal += montoModificacion;
        }

        if (prevSubtotal) prevSubtotal.textContent = formatearPrecio(subtotalActual);
        if (prevNuevoTotal) prevNuevoTotal.textContent = formatearPrecio(Math.max(0, nuevoTotal));
    };

    const actualizarTabs = () => {
        document.querySelectorAll(".tipo-modificador-tabs .tab-btn").forEach((btn) => {
            btn.classList.toggle("activo", btn.dataset.tipo === estadoModificador);
        });
    };

    const abrirModal = () => {
        if (!store.hayVentaActual()) {
            notificar("El changuito esta vacio. Carga productos primero.", "error");
            return;
        }

        estadoModificador = "descuento";
        if (selectorModo) selectorModo.value = "porcentaje";
        if (inputValorMod) inputValorMod.value = "";
        actualizarTabs();
        calcularPrevisualizacion();
        abrirModalOverlay(modalDescuento);
        setTimeout(() => inputValorMod?.focus(), 100);
    };

    inputValorMod?.addEventListener("input", calcularPrevisualizacion);
    selectorModo?.addEventListener("change", calcularPrevisualizacion);

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-descuento"]')) {
            abrirModal();
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-descuento"]')) {
            cerrarModalOverlay(modalDescuento);
            return;
        }

        const btnTab = event.target.closest('[data-accion="set-tipo-mod"]');
        if (btnTab) {
            estadoModificador = btnTab.dataset.tipo === "recargo" ? "recargo" : "descuento";
            actualizarTabs();
            calcularPrevisualizacion();
            return;
        }

        if (event.target.closest('[data-accion="aplicar-modificador"]')) {
            const valor = parseFloat(inputValorMod?.value);
            if (!Number.isFinite(valor) || valor <= 0) {
                notificar("Ingresa un monto mayor a 0.", "error");
                return;
            }

            store.setModificador({
                tipo: estadoModificador,
                modo: selectorModo?.value === "fijo" ? "fijo" : "porcentaje",
                valor,
            });

            cerrarModalOverlay(modalDescuento);
            notificar(`${estadoModificador === "descuento" ? "Descuento" : "Recargo"} aplicado correctamente.`);
        }
    });

    return { abrirModal };
}
