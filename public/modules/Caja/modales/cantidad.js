import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";

export function iniciarModalCantidad({ store, notificar }) {
    const modalCantidad = document.getElementById("modal-cantidad");
    const inputTecladoCantidad = document.getElementById("input-teclado-cantidad");
    let numpadValor = "1";
    let prodSeleccionadoNumpad = null;

    const actualizarVisor = () => {
        if (inputTecladoCantidad) {
            inputTecladoCantidad.value = numpadValor || "0";
        }
    };

    const confirmarCantidad = () => {
        if (!prodSeleccionadoNumpad) return;

        const cantidadFinal = Number(numpadValor.replace(",", ".")) || 1;
        const resultado = store.agregarProducto(prodSeleccionadoNumpad, cantidadFinal);

        if (!resultado.ok) {
            notificar(resultado.error, "error");
            return;
        }

        cerrarModalOverlay(modalCantidad);
        notificar(`Se agregaron ${cantidadFinal} ${prodSeleccionadoNumpad.unidadMedida} de ${prodSeleccionadoNumpad.nombre}`);
        prodSeleccionadoNumpad = null;
    };

    document.addEventListener("click", (event) => {
        const btnAbrirNumpad = event.target.closest('[data-accion="abrir-modal-cantidad"]');
        if (btnAbrirNumpad) {
            const card = btnAbrirNumpad.closest(".card-producto");
            if (!card) return;

            prodSeleccionadoNumpad = {
                id: Number(card.dataset.id),
                nombre: card.dataset.nombre,
                precio: parseFloat(card.dataset.precio),
                stock: card.dataset.stock === "" ? null : Number(card.dataset.stock),
                peso: card.dataset.peso === "true",
                unidadMedida: card.dataset.unidad || "u",
            };

            numpadValor = "1";
            actualizarVisor();
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
            confirmarCantidad();
            return;
        } else {
            const num = tecla.textContent.trim();
            if (numpadValor === "1" || numpadValor === "0" || numpadValor === "") {
                numpadValor = num;
            } else {
                numpadValor += num;
            }
        }

        actualizarVisor();
    });

    inputTecladoCantidad?.addEventListener("input", (event) => {
        numpadValor = event.target.value.replace(/[^0-9.,]/g, "");
    });

    inputTecladoCantidad?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        confirmarCantidad();
    });
}
