import { cerrarModalesAbiertos } from "../../../common/components/modalOverlay.js";

export function configurarAtajosTeclado() {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            cerrarModalesAbiertos();
            return;
        }

        if (event.key === "F1") {
            event.preventDefault();
        }

        if (event.key === "F2") {
            event.preventDefault();
            document.getElementById("input-lector-barras")?.focus();
        }

        if (event.key === "F3") {
            event.preventDefault();
            document.getElementById("btn-filtro-catalogo")?.click();
        }

        if (event.key === "F4") {
            event.preventDefault();
            document.getElementById("btn-pausar-recuperar")?.click();
        }

        if (event.key === "F5") {
            event.preventDefault();
            document.getElementById("btn-arqueo")?.click();
        }

        if (event.key === "F6") {
            event.preventDefault();
            document.getElementById("btn-descuento-global")?.click();
        }

        if (event.key === "F8") {
            event.preventDefault();
            document.getElementById("btn-search")?.click();
        }

        if (event.key === "F12") {
            event.preventDefault();
            const btnCobrar = document.getElementById("boton-cobrar");
            if (btnCobrar && !btnCobrar.disabled) {
                btnCobrar.click();
            }
        }
    });
}
