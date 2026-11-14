import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";

export function iniciarModalCantidad({ store, notificar }) {
    const modalCantidad = document.getElementById("modal-cantidad");
    const inputTecladoCantidad = document.getElementById("input-teclado-cantidad");
    let numpadValor = "1";
    let prodSeleccionadoNumpad = null;

    document.addEventListener("click", (event) => {
        const btnAbrirNumpad = event.target.closest('[data-accion="abrir-modal-cantidad"]');
        if (btnAbrirNumpad) {
            const card = btnAbrirNumpad.closest(".card-producto");
            if (!card) return;

            prodSeleccionadoNumpad = {
                id: Number(card.dataset.id),
                nombre: card.dataset.nombre,
                precio: parseFloat(card.dataset.precio),
            };

            numpadValor = "1";
            if (inputTecladoCantidad) inputTecladoCantidad.value = numpadValor;
            abrirModalOverlay(modalCantidad);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-cantidad"]')) {
            cerrarModalOverlay(modalCantidad);
            return;
        }

        const tecla = event.target.closest(".tecla");
        if (!tecla) return;

        if (tecla.classList.contains("tecla-borrar")) {
            numpadValor = "";
        } else if (tecla.classList.contains("tecla-aceptar")) {
            if (!prodSeleccionadoNumpad) return;

            const cantidadFinal = parseInt(numpadValor) || 1;
            store.agregarProducto(prodSeleccionadoNumpad, cantidadFinal);

            cerrarModalOverlay(modalCantidad);
            notificar(`Se agregaron ${cantidadFinal}x ${prodSeleccionadoNumpad.nombre}`);
            prodSeleccionadoNumpad = null;
        } else {
            const num = tecla.textContent.trim();
            if (numpadValor === "1" || numpadValor === "0" || numpadValor === "") {
                numpadValor = num;
            } else {
                numpadValor += num;
            }
        }

        if (inputTecladoCantidad) {
            inputTecladoCantidad.value = numpadValor || "0";
        }
    });
}
