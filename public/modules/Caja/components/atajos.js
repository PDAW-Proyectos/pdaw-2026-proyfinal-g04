import { cerrarModalesAbiertos } from "../../../common/components/modalOverlay.js";

export function configurarAtajosTeclado({ store, notificar } = {}) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      cerrarModalesAbiertos();
      return;
    }

    if (event.key === "Enter") {
      const modalAbierto = document.querySelector(
        ".modal-overlay:not(.modal-oculto)",
      );

      if (modalAbierto) {
        const botonConfirmar =
          modalAbierto.querySelector(
            "#btn-confirmar-apertura, #btn-confirmar-pausa, #btn-confirmar-cantidad, #btn-confirmar-balanza, #btn-confirmar-movimiento, #btn-confirmar-cobro",
          ) ??
          modalAbierto.querySelector(
            'button.btn-principal:not([disabled]), button[data-accion="aplicar-modificador"]:not([disabled]), button[data-accion="confirmar-cierre"]:not([disabled]), button[data-accion="confirmar-pausa"]:not([disabled])',
          );

        if (
          botonConfirmar &&
          !botonConfirmar.disabled &&
          !botonConfirmar.classList.contains("paso-oculto")
        ) {
          event.preventDefault();
          botonConfirmar.click();
        }
      }
      return;
    }

    if (event.key === "Delete") {
      const elementoActivo = document.activeElement;
      const escribiendo =
        elementoActivo instanceof HTMLInputElement ||
        elementoActivo instanceof HTMLTextAreaElement ||
        elementoActivo?.isContentEditable;

      if (!escribiendo && store?.hayVentaActual()) {
        event.preventDefault();
        store.limpiarVenta();
        notificar?.("Venta vaciada correctamente.");
      }
      return;
    }

    if (event.key === "F1") {
      event.preventDefault();
      document.querySelector('.nav-enlace[data-nav="inicio"]')?.click();
    }

    if (event.key === "F2") {
      event.preventDefault();
      const vistaActiva = document.querySelector(".vista-tab.activa");
      vistaActiva?.querySelector(".lector-input")?.focus();
    }

    if (event.key === "F3") {
      event.preventDefault();
      document.getElementById("btn-pausar-recuperar")?.click();
    }

    if (event.key === "F4") {
      event.preventDefault();
      document.getElementById("btn-descuento-global")?.click();
    }

    if (event.key === "F5") {
      event.preventDefault();
      document.getElementById("btn-consulta-rapida")?.click();
    }

    if (event.key === "F6") {
      event.preventDefault();
      document.querySelector('.nav-enlace[data-nav="catalogo"]')?.click();
    }

    if (event.key === "F7") {
      event.preventDefault();
      document.querySelector('.nav-enlace[data-nav="ventas"]')?.click();
    }

    if (event.key === "F8") {
      event.preventDefault();
      document.querySelector('.nav-enlace[data-nav="arqueo"]')?.click();
    }

    if (event.key === "F9") {
      event.preventDefault();
      document.getElementById("btn-arqueo")?.click();
    }

    if (event.key === "F10") {
      event.preventDefault();
      document.querySelector('.nav-enlace[data-nav="historial"]')?.click();
    }

    if (event.key === "F11") {
      event.preventDefault();
      document.getElementById("boton-cerrar-caja")?.click();
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
