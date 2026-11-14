import { renderizarIconos } from "./iconos.js";

export function confirmarAccion({ titulo = "Confirmar acción", mensaje = "", textoConfirmar = "Confirmar", textoCancelar = "Cancelar", peligro = false } = {}) {
    return new Promise((resolver) => {
        const dialog = document.createElement("dialog");
        dialog.className = "modal-base";
        dialog.innerHTML = `
            <div class="modal-contenido">
                <div class="modal-header">
                <h2>${titulo}</h2>
                </div>
                <p class="modal-subtitle">${mensaje}</p>
                <div class="modal-acciones" style="margin-top: 24px;">
                <button type="button" class="btn-fantasma" id="btn-cancelar-accion">
                    ${textoCancelar}
                </button>
                <button type="button" class="${peligro ? "btn-alerta" : "btn-primario"}" id="btn-confirmar-accion">
                    ${textoConfirmar}
                </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
        renderizarIconos(dialog);
        dialog.showModal();

        const cerrar = (resultado) => {
            dialog.close();
            dialog.remove();
            resolver(resultado);
        };

        dialog.querySelector("#btn-cancelar-accion").addEventListener("click", () => cerrar(false));

        dialog.querySelector("#btn-confirmar-accion").addEventListener("click", () => cerrar(true));

        dialog.addEventListener("cancel", (event) => {
            event.preventDefault();
            cerrar(false);
        });
    });
}
