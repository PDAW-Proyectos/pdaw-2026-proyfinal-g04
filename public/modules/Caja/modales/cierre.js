import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";

const TOTAL_ESPERADO_CIERRE = 12450.0;

export function iniciarModalCierre() {
    const modalCierre = document.getElementById("modal-cierre");
    const inputEfectivoCierre = document.getElementById("input-efectivo-cierre");
    const txtDiferenciaCierre = document.getElementById("txt-diferencia-cierre");

    if (inputEfectivoCierre && txtDiferenciaCierre) {
        inputEfectivoCierre.addEventListener("input", (event) => {
            const contado = parseFloat(event.target.value) || 0;
            const diferencia = contado - TOTAL_ESPERADO_CIERRE;

            const formatoMoneda = Math.abs(diferencia).toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            if (diferencia < 0) {
                txtDiferenciaCierre.textContent = `- $ ${formatoMoneda}`;
                txtDiferenciaCierre.className = "diferencia-valor texto-peligro";
            } else {
                txtDiferenciaCierre.textContent = `$ ${formatoMoneda}`;
                txtDiferenciaCierre.className = "diferencia-valor texto-ok";
            }
        });
    }

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-cierre"]')) {
            if (inputEfectivoCierre) inputEfectivoCierre.value = "";
            if (txtDiferenciaCierre) {
                txtDiferenciaCierre.textContent = "$ 0,00";
                txtDiferenciaCierre.className = "diferencia-valor texto-ok";
            }

            abrirModalOverlay(modalCierre);
            setTimeout(() => inputEfectivoCierre?.focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-cierre"]')) {
            cerrarModalOverlay(modalCierre);
            return;
        }

        if (event.target.closest('[data-accion="confirmar-cierre"]')) {
            const contado = parseFloat(inputEfectivoCierre.value) || 0;
            const diferencia = contado - TOTAL_ESPERADO_CIERRE;

            console.log(`Ejecutando cierre de caja: Contado $${contado} | Diferencia $${diferencia}`);

            cerrarModalOverlay(modalCierre);
            alert("Caja cerrada exitosamente.");
        }
    });
}
