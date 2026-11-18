import { abrirModalOverlay, cerrarModalOverlay } from "../../../common/components/modalOverlay.js";

export function iniciarModalCantidad({ store, notificar }) {
    const modalCantidad = document.getElementById("modal-cantidad");
    const inputTecladoCantidad = document.getElementById("input-teclado-cantidad");
    const modalBalanza = document.getElementById("modal-balanza");
    const inputPesoGramos = document.getElementById("input-peso-gramos");
    const visorPrecioBalanza = document.getElementById("precio-calculado-balanza");
    const nombreProductoBalanza = document.getElementById("nombre-prod-balanza");
    const precioKgBalanza = document.getElementById("precio-kg-balanza");
    let numpadValor = "1";
    let prodSeleccionadoNumpad = null;

    const actualizarPrecioBalanza = () => {
        if (!prodSeleccionadoNumpad || !visorPrecioBalanza) return;

        const gramos = Number(inputPesoGramos?.value) || 0;
        const precioTotal = (prodSeleccionadoNumpad.precio * gramos) / 1000;
        visorPrecioBalanza.textContent =
            `$ ${precioTotal.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`;
    };

    inputPesoGramos?.addEventListener("input", actualizarPrecioBalanza);

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

            const stock = card.dataset.stock === "" ? null : Number(card.dataset.stock);
            if (stock !== null && stock <= 0) {
                notificar("Sin existencias disponibles.", "error");
                return;
            }

            prodSeleccionadoNumpad = {
                id: Number(card.dataset.id),
                nombre: card.dataset.nombre,
                precio: parseFloat(card.dataset.precio),
                stock: card.dataset.stock === "" ? null : Number(card.dataset.stock),
                peso: card.dataset.peso === "true",
                unidadMedida: card.dataset.unidad || "u",
                categoria: card.dataset.categoria || "",
            };

            const categoria = prodSeleccionadoNumpad.categoria
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

            if (categoria === "verduleria") {
                if (nombreProductoBalanza) {
                    nombreProductoBalanza.textContent = prodSeleccionadoNumpad.nombre;
                }
                if (precioKgBalanza) {
                    precioKgBalanza.textContent =
                        `$ ${prodSeleccionadoNumpad.precio.toLocaleString("es-AR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}`;
                }
                if (inputPesoGramos) inputPesoGramos.value = "";
                if (visorPrecioBalanza) visorPrecioBalanza.textContent = "$ 0,00";
                if (modalBalanza) {
                    abrirModalOverlay(modalBalanza);
                    setTimeout(() => inputPesoGramos?.focus(), 100);
                }
                return;
            }

            numpadValor = "1";
            actualizarVisor();
            abrirModalOverlay(modalCantidad);
            return;
        }

        if (event.target.closest('[data-accion="cerrar-modal-balanza"]')) {
            cerrarModalOverlay(modalBalanza);
            prodSeleccionadoNumpad = null;
            return;
        }

        if (event.target.closest("#btn-confirmar-balanza")) {
            if (!prodSeleccionadoNumpad) return;

            const gramos = Number(inputPesoGramos?.value) || 0;
            if (gramos <= 0) {
                notificar("Ingresa un peso valido.", "error");
                return;
            }

            const kilos = gramos / 1000;
            const resultado = store.agregarProducto(prodSeleccionadoNumpad, kilos);

            if (!resultado.ok) {
                notificar(resultado.error, "error");
                return;
            }

            cerrarModalOverlay(modalBalanza);
            notificar(
                `Se agregaron ${gramos} gr de ${prodSeleccionadoNumpad.nombre}.`,
            );
            prodSeleccionadoNumpad = null;
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

    document.addEventListener("keydown", (event) => {
        if (modalCantidad && !modalCantidad.classList.contains("modal-oculto")) {
            if (/^\d$/.test(event.key)) {
                event.preventDefault();
                event.stopImmediatePropagation();

                if (numpadValor === "1" || numpadValor === "0" || numpadValor === "") {
                    numpadValor = event.key;
                } else {
                    numpadValor += event.key;
                }
                actualizarVisor();
                return;
            }

            if (event.key === "." || event.key === ",") {
                event.preventDefault();
                event.stopImmediatePropagation();
                if (!numpadValor.includes(".") && !numpadValor.includes(",")) {
                    numpadValor += ",";
                    actualizarVisor();
                }
                return;
            }

            if (event.key === "Backspace") {
                event.preventDefault();
                event.stopImmediatePropagation();
                numpadValor = numpadValor.slice(0, -1);
                actualizarVisor();
                return;
            }

            if (event.key === "Delete" || event.key.toLowerCase() === "c") {
                event.preventDefault();
                event.stopImmediatePropagation();
                numpadValor = "";
                actualizarVisor();
                return;
            }

            if (event.key === "Enter") {
                event.preventDefault();
                event.stopImmediatePropagation();
                confirmarCantidad();
                return;
            }
        }

        if (modalBalanza && !modalBalanza.classList.contains("modal-oculto")) {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopImmediatePropagation();

                if (!prodSeleccionadoNumpad) return;

                const gramos = Number(inputPesoGramos?.value) || 0;
                if (gramos <= 0) {
                    notificar("Ingresa un peso valido.", "error");
                    return;
                }

                const resultado = store.agregarProducto(
                    prodSeleccionadoNumpad,
                    gramos / 1000,
                );

                if (!resultado.ok) {
                    notificar(resultado.error, "error");
                    return;
                }

                cerrarModalOverlay(modalBalanza);
                notificar(
                    `Se agregaron ${gramos} gr de ${prodSeleccionadoNumpad.nombre}.`,
                );
                prodSeleccionadoNumpad = null;
            }
        }
    });
}
