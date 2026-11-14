export function crearFormNegocio({ api, notificar }) {
    const formNegocio = document.getElementById("form-negocio");
    const inputsNegocio = {
        nombre: document.getElementById("negocio-nombre"),
        telefono: document.getElementById("negocio-telefono"),
        direccion: document.getElementById("negocio-direccion"),
    };
    const previewNegocio = {
        nombre: document.getElementById("negocio-preview-nombre"),
        telefono: document.getElementById("negocio-preview-telefono"),
        direccion: document.getElementById("negocio-preview-direccion"),
    };

    const actualizarVistaPrevia = () => {
        previewNegocio.nombre.textContent = inputsNegocio.nombre.value.trim() || "Nombre del negocio";
        previewNegocio.telefono.textContent = inputsNegocio.telefono.value.trim() || "Sin especificar";
        previewNegocio.direccion.textContent = inputsNegocio.direccion.value.trim() || "Sin especificar";
    };

    Object.values(inputsNegocio).forEach((input) => {
        input.addEventListener("input", actualizarVistaPrevia);
    });

    formNegocio.addEventListener("submit", async (event) => {
        event.preventDefault();

        try {
            await api.actualizar({
                negocio: {
                    nombre: inputsNegocio.nombre.value.trim(),
                    telefono: inputsNegocio.telefono.value.trim(),
                    direccion: inputsNegocio.direccion.value.trim(),
                },
            });
            actualizarVistaPrevia();
            notificar("Datos del negocio guardados");
        } catch (error) {
            console.error("Error guardando los datos del negocio:", error);
            notificar(error.message || "No se pudieron guardar los datos", true);
        }
    });

    return {
        cargar(configuracion) {
            const negocio = configuracion.negocio;
            inputsNegocio.nombre.value = negocio.nombre;
            inputsNegocio.telefono.value = negocio.telefono;
            inputsNegocio.direccion.value = negocio.direccion;
            actualizarVistaPrevia();
        },
    };
}
