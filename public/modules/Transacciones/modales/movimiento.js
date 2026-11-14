import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";

export function iniciarModalMovimiento() {
    const modalMovimiento = document.getElementById("modal-registrar-movimiento");
    const paso1Mov = document.getElementById("movimiento-paso-1");
    const paso2Mov = document.getElementById("movimiento-paso-2");
    const btnConfirmarMov = document.getElementById("btn-confirmar-movimiento");
    const resumenSeleccion = document.getElementById("resumen-seleccion-movimiento");
    const labelMonto = document.getElementById("label-monto");
    const labelConcepto = document.getElementById("label-concepto");
    const grupoMonto = document.getElementById("grupo-monto");
    const grupoConcepto = document.getElementById("grupo-concepto");
    let pasoActualMovimiento = 1;

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-movimiento"]')) {
            pasoActualMovimiento = 1;
            paso1Mov.classList.remove("paso-oculto");
            paso2Mov.classList.add("paso-oculto");
            btnConfirmarMov.classList.add("paso-oculto");
            abrirModalOverlay(modalMovimiento);
            return;
        }

        const btnAvanzar = event.target.closest('[data-accion="avanzar-paso-2"]');
        if (btnAvanzar) {
            const tipo = btnAvanzar.dataset.tipo;
            resumenSeleccion.innerHTML = btnAvanzar.innerHTML;

            grupoMonto.style.order = "1";
            grupoConcepto.style.order = "2";
            document.getElementById("grupo-responsable").style.order = "3";

            if (tipo === "ingreso") {
                labelMonto.textContent = "Monto a ingresar";
                labelConcepto.textContent = "Motivo / Concepto";
            } else if (tipo === "egreso") {
                labelMonto.textContent = "Monto a egresar";
                labelConcepto.textContent = "Motivo / Concepto";
            } else if (tipo === "ajuste") {
                labelMonto.textContent = "Monto del ajuste";
                labelConcepto.textContent = "Motivo / Concepto";
            } else if (tipo === "otro") {
                labelConcepto.textContent = "Concepto";
                labelMonto.textContent = "Monto";
                grupoConcepto.style.order = "1";
                grupoMonto.style.order = "2";
            }

            paso1Mov.classList.add("paso-oculto");
            paso2Mov.classList.remove("paso-oculto");
            btnConfirmarMov.classList.remove("paso-oculto");
            pasoActualMovimiento = 2;

            setTimeout(() => document.getElementById("input-monto-mov").focus(), 100);
            return;
        }

        if (event.target.closest('[data-accion="volver-o-cerrar-movimiento"]') || event.target.closest('[data-accion="cerrar-modal-movimiento"]')) {
            if (pasoActualMovimiento === 1 || event.target.closest('[data-accion="cerrar-modal-movimiento"]')) {
                cerrarModalOverlay(modalMovimiento);
            } else {
                paso1Mov.classList.remove("paso-oculto");
                paso2Mov.classList.add("paso-oculto");
                btnConfirmarMov.classList.add("paso-oculto");
                pasoActualMovimiento = 1;
            }
            return;
        }

        if (event.target.closest("#btn-confirmar-movimiento")) {
            const monto = document.getElementById("input-monto-mov").value;
            if (!monto || monto <= 0) {
                alert("Por favor, ingresá un monto válido.");
                return;
            }

            console.log("Movimiento registrado por $", monto);
            cerrarModalOverlay(modalMovimiento);
            document.getElementById("form-registro-mov").reset();
        }
    });
}
