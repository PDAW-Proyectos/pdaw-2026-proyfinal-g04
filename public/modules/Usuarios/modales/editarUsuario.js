import { confirmarAccion } from "../../../common/utils/confirmar.js";

export function crearModalEditarUsuario({ modal, form, botonBorrar, api, notificar, onActualizado }) {
    const idInput = document.getElementById("modal-usuario-id");
    const nombreElemento = document.getElementById("modal-nombre-usuario");
    const rolSelect = document.getElementById("modal-rol-usuario");
    const habilitadoSelect = document.getElementById("modal-usuario-habilitado");

    document.querySelectorAll("#cerrar-modal-usuario, #btn-cancelar-modal-usuario").forEach((btn) => {
        if (btn) btn.addEventListener("click", () => modal.close());
    });

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const id = idInput.value;
            const payload = {
                rol: rolSelect.value,
                habilitado: habilitadoSelect.value === "true",
            };

            try {
                await api.actualizar(id, payload);
                notificar("Usuario actualizado");
                modal.close();
                await onActualizado();
            } catch (error) {
                console.error(error);
                notificar("Error al guardar", true);
            }
        });
    }

    if (botonBorrar) {
        botonBorrar.addEventListener("click", async () => {
            const id = idInput.value;
            const nombre = nombreElemento.textContent;

            const confirmado = await confirmarAccion({
                titulo: "¿Borrar usuario?",
                mensaje: `Estás a punto de borrar a <strong>${nombre}</strong>. Esta acción no se puede deshacer.`,
                textoConfirmar: "Sí, borrar",
                peligro: true,
            });

            if (!confirmado) return;

            try {
                await api.eliminar(id);
                notificar("Usuario eliminado correctamente");
                modal.close();
                await onActualizado();
            } catch (error) {
                console.error(error);
                notificar("Error al eliminar el usuario", true);
            }
        });
    }

    return {
        abrir(user) {
            if (!user || !modal) return;

            idInput.value = user.id;
            nombreElemento.textContent = user.nombre;
            rolSelect.value = user.rol;
            habilitadoSelect.value = user.habilitado !== false ? "true" : "false";
            modal.showModal();
        },
    };
}
