import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";
import { opcionesCambioReintegro, opcionesDevolucion } from "../data/transacciones.mock.js";

export function iniciarModalHistorial() {
    const modalHistorial = document.getElementById("modal-historial-movimiento");
    const labelMontoHistorial = document.getElementById("label-monto-historial");
    const inputMontoHistorial = document.getElementById("input-monto-historial");

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-historial"]')) {
            document.querySelectorAll("#modal-historial-movimiento .tab-btn").forEach((btn) => btn.classList.remove("activo"));
            document.querySelector('#modal-historial-movimiento .tab-btn[data-tipo="reintegro"]')?.classList.add("activo");

            labelMontoHistorial.textContent = "Monto a reintegrar";
            inputMontoHistorial.value = "";
            document.getElementById("select-motivo-historial").value = "";
            document.getElementById("input-obs-historial").value = "";

            abrirModalOverlay(modalHistorial);
            setTimeout(() => inputMontoHistorial.focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-historial"]')) {
            cerrarModalOverlay(modalHistorial);
            return;
        }

        const btnTabHistorial = event.target.closest('[data-accion="set-tipo-historial"]');
        if (btnTabHistorial) {
            document.querySelectorAll("#modal-historial-movimiento .tab-btn").forEach((btn) => btn.classList.remove("activo"));
            btnTabHistorial.classList.add("activo");

            const tipo = btnTabHistorial.dataset.tipo;
            const selectMotivo = document.getElementById("select-motivo-historial");

            if (tipo === "devolucion") {
                labelMontoHistorial.textContent = "Monto a devolver";
                selectMotivo.innerHTML = opcionesDevolucion;
            } else {
                labelMontoHistorial.textContent = "Monto a reintegrar";
                selectMotivo.innerHTML = opcionesCambioReintegro;
            }
            return;
        }

        if (event.target.closest('[data-accion="confirmar-historial"]')) {
            const monto = inputMontoHistorial.value;
            const motivo = document.getElementById("select-motivo-historial").value;
            const tabActiva = document.querySelector("#modal-historial-movimiento .tab-btn.activo");

            if (!tabActiva || !monto || Number(monto) <= 0) {
                alert("Ingresá un monto válido.");
                return;
            }

            console.log(`Registrando ${tabActiva.dataset.tipo}: $${monto} | Motivo: ${motivo || "Ninguno"}`);

            cerrarModalOverlay(modalHistorial);
        }
    });
}
