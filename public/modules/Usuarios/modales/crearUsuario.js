import { renderizarIconos } from "../../../common/utils/iconos.js";

export function crearModalCrearUsuario({ modal, form, api, notificar, onCreado }) {
    const btnAbrir = document.getElementById("btn-nuevo-usuario");
    const btnCerrar = document.getElementById("cerrar-modal-crear-usuario");
    const btnCancelar = document.getElementById("btn-cancelar-crear-usuario");

    if (btnAbrir) {
        btnAbrir.addEventListener("click", (event) => {
            event.preventDefault();
            if (form) form.reset();
            if (modal && typeof modal.showModal === "function") {
                modal.showModal();
            }
        });
    }

    [btnCerrar, btnCancelar].forEach((btn) => {
        if (btn) btn.addEventListener("click", () => modal?.close());
    });

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const nuevoUsuario = {
                nombre: document.getElementById("crear-nombre").value,
                apellido: document.getElementById("crear-apellido").value,
                email: document.getElementById("crear-email").value,
                contraseña: document.getElementById("crear-contraseña").value,
                rol: document.getElementById("crear-rol").value,
                habilitado: true,
            };

            try {
                await api.crear(nuevoUsuario);
                modal.close();
                await onCreado();
                notificar("¡Usuario creado y guardado con éxito!");
                renderizarIconos();
            } catch (error) {
                console.error(error);
                notificar(error.message || "Hubo un error al crear el usuario.", true);
            }
        });
    }
}
