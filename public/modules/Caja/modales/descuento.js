import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { formatearPrecio } from "../../../common/utils/formato.js";

export function iniciarModalDescuento({ store, notificar }) {
    const modalDescuento = document.getElementById("modal-descuento");
    const inputValorMod = document.getElementById("input-valor-mod");
    const indicadorTipoValor = document.getElementById("tipo-valor");
    const prevSubtotal = document.getElementById("prev-subtotal");
    const prevNuevoTotal = document.getElementById("prev-nuevo-total");

    let estadoModificador = "descuento";
    let subtotalActual = 0;

    const calcularPrevisualizacion = () => {
        const valorInput = parseFloat(inputValorMod.value) || 0;
        const esPorcentaje = indicadorTipoValor.dataset.valor === "porcentaje";
        const montoModificacion = esPorcentaje ? subtotalActual * (valorInput / 100) : valorInput;

        let nuevoTotal = subtotalActual;
        if (estadoModificador === "descuento") {
            nuevoTotal -= montoModificacion;
        } else {
            nuevoTotal += montoModificacion;
        }

        nuevoTotal = Math.max(0, nuevoTotal);
        prevNuevoTotal.textContent = formatearPrecio(nuevoTotal);
    };

    if (inputValorMod) {
        inputValorMod.addEventListener("input", calcularPrevisualizacion);
    }

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-descuento"]')) {
            if (!store.hayVentaActual()) {
                notificar("El changuito está vacío. Cargá productos primero.", "error");
                return;
            }

            subtotalActual = store.subtotal();
            prevSubtotal.textContent = formatearPrecio(subtotalActual);
            inputValorMod.value = "";
            calcularPrevisualizacion();
            abrirModalOverlay(modalDescuento);
            setTimeout(() => inputValorMod.focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-descuento"]')) {
            cerrarModalOverlay(modalDescuento);
            return;
        }

        const btnTab = event.target.closest('[data-accion="set-tipo-mod"]');
        if (btnTab) {
            document.querySelectorAll(".tipo-modificador-tabs .tab-btn").forEach((btn) => btn.classList.remove("activo"));
            btnTab.classList.add("activo");

            estadoModificador = btnTab.dataset.tipo;
            indicadorTipoValor.dataset.valor = estadoModificador === "descuento" ? "porcentaje" : "fijo";
            indicadorTipoValor.textContent = estadoModificador === "descuento" ? "%" : "$";
            calcularPrevisualizacion();
            return;
        }

        if (event.target.closest('[data-accion="aplicar-modificador"]')) {
            const valorInput = parseFloat(inputValorMod.value) || 0;
            if (valorInput <= 0) {
                notificar("Ingresá un monto mayor a 0", "error");
                return;
            }

            alert(`${estadoModificador.toUpperCase()} aplicado con éxito.`);
            cerrarModalOverlay(modalDescuento);
        }
    });
}
