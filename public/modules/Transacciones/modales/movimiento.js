import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";

export function iniciarModalMovimiento({ store, api, notificar, alRegistrar }) {
    const modalMovimiento = document.getElementById("modal-registrar-movimiento");
    const paso1Mov = document.getElementById("movimiento-paso-1");
    const paso2Mov = document.getElementById("movimiento-paso-2");
    const btnConfirmarMov = document.getElementById("btn-confirmar-movimiento");
    const resumenSeleccion = document.getElementById("resumen-seleccion-movimiento");
    const labelMonto = document.getElementById("label-monto");
    const inputMonto = document.getElementById("input-monto-mov");
    const formulario = document.getElementById("form-registro-mov");
    let pasoActualMovimiento = 1;
    let tipoSeleccionado = null;
    let enviando = false;

    const mostrarPaso = (paso) => {
        pasoActualMovimiento = paso;
        paso1Mov?.classList.toggle("paso-oculto", paso !== 1);
        paso2Mov?.classList.toggle("paso-oculto", paso !== 2);
        btnConfirmarMov?.classList.toggle("paso-oculto", paso !== 2);
    };

    const abrirModal = () => {
        if (!store.obtenerCaja()) {
            notificar("Primero tenes que abrir una caja.", "error");
            return;
        }

        tipoSeleccionado = null;
        formulario?.reset();
        mostrarPaso(1);
        abrirModalOverlay(modalMovimiento);
    };

    const confirmarMovimiento = async () => {
        if (enviando) return;

        const caja = store.obtenerCaja();
        const monto = Number(inputMonto?.value);

        if (!caja || !Number.isFinite(monto) || monto <= 0) {
            notificar("Ingresa un monto valido.", "error");
            return;
        }

        enviando = true;
        if (btnConfirmarMov) btnConfirmarMov.disabled = true;

        try {
            if (tipoSeleccionado === "egreso") {
                await api.registrarRetiro(caja.id, { monto });
            } else {
                await api.registrarVenta(caja.id, {
                    monto,
                    metodoDePago: "efectivo",
                    articulos: [],
                });
            }

            await alRegistrar();
            cerrarModalOverlay(modalMovimiento);
            formulario?.reset();
            notificar("Movimiento registrado correctamente.");
        } catch (error) {
            notificar(error.message, "error");
        } finally {
            enviando = false;
            if (btnConfirmarMov) btnConfirmarMov.disabled = false;
        }
    };

    document.addEventListener("click", (event) => {
        if (event.target.closest('[data-accion="abrir-modal-movimiento"]')) {
            abrirModal();
            return;
        }

        const btnAvanzar = event.target.closest('[data-accion="avanzar-paso-2"]');
        if (btnAvanzar) {
            tipoSeleccionado = btnAvanzar.dataset.tipo === "egreso" ? "egreso" : "ingreso";

            if (resumenSeleccion) resumenSeleccion.innerHTML = btnAvanzar.innerHTML;
            if (labelMonto) {
                labelMonto.textContent = tipoSeleccionado === "egreso" ? "Monto a egresar" : "Monto a ingresar";
            }

            mostrarPaso(2);
            setTimeout(() => inputMonto?.focus(), 100);
            return;
        }

        if (
            event.target.closest('[data-accion="volver-o-cerrar-movimiento"]') ||
            event.target.closest('[data-accion="cerrar-modal-movimiento"]')
        ) {
            if (pasoActualMovimiento === 1 || event.target.closest('[data-accion="cerrar-modal-movimiento"]')) {
                cerrarModalOverlay(modalMovimiento);
            } else {
                mostrarPaso(1);
            }
            return;
        }

        if (event.target.closest("#btn-confirmar-movimiento")) {
            confirmarMovimiento();
        }
    });
}
